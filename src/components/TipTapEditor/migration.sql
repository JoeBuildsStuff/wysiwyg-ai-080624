-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the wysiwyg_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS wysiwyg_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    storage_path TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    mime_type VARCHAR(100),
    file_size INTEGER,
    tags TEXT[]
);

-- Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_wysiwyg_documents_user_id ON wysiwyg_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_wysiwyg_documents_created_at ON wysiwyg_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_wysiwyg_documents_tags ON wysiwyg_documents USING GIN (tags);

-- Enable Row Level Security (if not already enabled)
ALTER TABLE wysiwyg_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own wysiwyg documents" ON wysiwyg_documents;
DROP POLICY IF EXISTS "Users can insert own wysiwyg documents" ON wysiwyg_documents;
DROP POLICY IF EXISTS "Users can update own wysiwyg documents" ON wysiwyg_documents;
DROP POLICY IF EXISTS "Users can delete own wysiwyg documents" ON wysiwyg_documents;
DROP POLICY IF EXISTS "Public can view public wysiwyg documents" ON wysiwyg_documents;

-- Create policies for wysiwyg_documents table
CREATE POLICY "Users can view own wysiwyg documents" ON wysiwyg_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wysiwyg documents" ON wysiwyg_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wysiwyg documents" ON wysiwyg_documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wysiwyg documents" ON wysiwyg_documents FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view public wysiwyg documents" ON wysiwyg_documents FOR SELECT
    USING (is_public = TRUE);

-- Set up storage (if not already set up)
INSERT INTO storage.buckets (id, name, public)
VALUES ('wysiwyg-documents', 'wysiwyg-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow authenticated uploads to wysiwyg-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own wysiwyg document files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read own wysiwyg document files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own wysiwyg document files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to public wysiwyg document files" ON storage.objects;

-- Set up policies for storage
CREATE POLICY "Allow authenticated uploads to wysiwyg-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wysiwyg-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to update own wysiwyg document files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'wysiwyg-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to read own wysiwyg document files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'wysiwyg-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete own wysiwyg document files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'wysiwyg-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public read access to public wysiwyg document files"
ON storage.objects
FOR SELECT
TO public
USING (
    bucket_id = 'wysiwyg-documents' 
    AND EXISTS (
        SELECT 1 FROM wysiwyg_documents
        WHERE wysiwyg_documents.storage_path = storage.objects.name
        AND wysiwyg_documents.is_public = true
    )
);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_wysiwyg_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before each update (drop if exists, then create)
DROP TRIGGER IF EXISTS update_wysiwyg_documents_updated_at ON wysiwyg_documents;
CREATE TRIGGER update_wysiwyg_documents_updated_at
BEFORE UPDATE ON wysiwyg_documents
FOR EACH ROW
EXECUTE FUNCTION update_wysiwyg_documents_updated_at();

-- Create the wysiwyg_references table if it doesn't exist
CREATE TABLE IF NOT EXISTS wysiwyg_references (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, storage_path)
);

-- Create the wysiwyg_document_reference_mappings table if it doesn't exist
CREATE TABLE IF NOT EXISTS wysiwyg_document_reference_mappings (
    document_id UUID REFERENCES wysiwyg_documents(id) ON DELETE CASCADE,
    reference_id UUID REFERENCES wysiwyg_references(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (document_id, reference_id)
);

-- Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_document_reference_mappings_document_id ON wysiwyg_document_reference_mappings(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reference_mappings_reference_id ON wysiwyg_document_reference_mappings(reference_id);

-- Drop old triggers and functions
DROP TRIGGER IF EXISTS delete_wysiwyg_document_file_trigger ON wysiwyg_documents;
DROP FUNCTION IF EXISTS delete_wysiwyg_document_file();
DROP TRIGGER IF EXISTS delete_associated_references_trigger ON wysiwyg_documents;
DROP FUNCTION IF EXISTS delete_associated_references();

-- Function to delete associated references and storage files when a document is deleted
CREATE OR REPLACE FUNCTION delete_associated_references_and_files()
RETURNS TRIGGER AS $$
DECLARE
    ref_storage_path TEXT;
BEGIN
    -- Delete associated references and their files
    FOR ref_storage_path IN (
        SELECT wr.storage_path
        FROM wysiwyg_references wr
        JOIN wysiwyg_document_reference_mappings wdrm ON wr.id = wdrm.reference_id
        WHERE wdrm.document_id = OLD.id
    )
    LOOP
        -- Delete the reference file from storage
        DELETE FROM storage.objects
        WHERE bucket_id = 'wysiwyg-documents' AND name = ref_storage_path;
    END LOOP;

    -- Delete references that are only associated with the deleted document
    DELETE FROM wysiwyg_references
    WHERE id IN (
        SELECT reference_id
        FROM wysiwyg_document_reference_mappings
        WHERE document_id = OLD.id
    ) AND id NOT IN (
        SELECT reference_id
        FROM wysiwyg_document_reference_mappings
        WHERE document_id != OLD.id
    );

    -- Delete the document file from storage
    DELETE FROM storage.objects
    WHERE bucket_id = 'wysiwyg-documents' AND name = OLD.storage_path;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the new trigger
DROP TRIGGER IF EXISTS delete_associated_references_and_files_trigger ON wysiwyg_documents;
CREATE TRIGGER delete_associated_references_and_files_trigger
AFTER DELETE ON wysiwyg_documents
FOR EACH ROW
EXECUTE FUNCTION delete_associated_references_and_files();

-- Comment on the new function
COMMENT ON FUNCTION delete_associated_references_and_files() IS 'Deletes associated references, their files, and the document file when a document is deleted';

-- Grant necessary permissions to the authenticator role
GRANT USAGE ON SCHEMA storage TO authenticator;
GRANT SELECT, DELETE ON storage.objects TO authenticator;
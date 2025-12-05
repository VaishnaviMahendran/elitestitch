import { Upload, Image as ImageIcon, Check, X as XIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import styles from './OrderSteps.module.css';

interface StepDesignProps {
    onNext: (data: any) => void;
    initialData: any;
}

export default function StepDesign({ onNext, initialData }: StepDesignProps) {
    const [preview, setPreview] = useState<string | null>(initialData?.previewUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    const handleConfirm = () => {
        if (selectedFile) {
            console.log('File confirmed:', selectedFile.name);
            onNext({
                designType: 'custom_upload',
                designFile: selectedFile.name,
                previewUrl: preview
            });
        }
    };

    const handleClear = () => {
        setPreview(null);
        setSelectedFile(null);
    };

    return (
        <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Choose Your Design</h2>

            {preview ? (
                <div className={styles.previewContainer}>
                    <h3>Confirm Your Design</h3>
                    <div className={styles.imagePreview}>
                        <img src={preview} alt="Design Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                    </div>
                    <div className={styles.previewActions}>
                        <button className="btn btn-outline" onClick={handleClear}>
                            <XIcon size={18} style={{ marginRight: '0.5rem' }} />
                            Change Image
                        </button>
                        <button className="btn btn-primary" onClick={handleConfirm}>
                            <Check size={18} style={{ marginRight: '0.5rem' }} />
                            Confirm & Next
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.optionsGrid}>
                    <div className={styles.optionCard}>
                        <div className={styles.iconWrapper}>
                            <ImageIcon size={40} />
                        </div>
                        <h3>Select from Gallery</h3>
                        <p>Browse our curated collection of premium designs</p>
                        <Link href="/designs" className="btn btn-outline" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Browse Gallery
                        </Link>
                    </div>

                    <div className={styles.optionCard}>
                        <div className={styles.iconWrapper}>
                            <Upload size={40} />
                        </div>
                        <h3>Upload Your Own</h3>
                        <p>Have a specific design in mind? Upload an image</p>
                        <input
                            type="file"
                            id="design-upload"
                            hidden
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                        <label htmlFor="design-upload" className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                            Upload Image
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import styles from './OrderSteps.module.css';

interface StepMeasurementsProps {
    onNext: (data: any) => void;
    onBack: () => void;
    initialData: any;
}

export default function StepMeasurements({ onNext, onBack, initialData }: StepMeasurementsProps) {
    const [measurements, setMeasurements] = useState({
        chest: '',
        waist: '',
        hips: '',
        shoulder: '',
        sleeve: '',
        length: '',
        ...initialData
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMeasurements({ ...measurements, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext(measurements);
    };

    return (
        <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Your Measurements</h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
                Please enter your measurements in inches (Optional).
            </p>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="chest">Chest / Bust</label>
                        <input
                            type="number"
                            id="chest"
                            name="chest"
                            value={measurements.chest}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="waist">Waist</label>
                        <input
                            type="number"
                            id="waist"
                            name="waist"
                            value={measurements.waist}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="hips">Hips</label>
                        <input
                            type="number"
                            id="hips"
                            name="hips"
                            value={measurements.hips}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="shoulder">Shoulder Width</label>
                        <input
                            type="number"
                            id="shoulder"
                            name="shoulder"
                            value={measurements.shoulder}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="sleeve">Sleeve Length</label>
                        <input
                            type="number"
                            id="sleeve"
                            name="sleeve"
                            value={measurements.sleeve}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="length">Total Length</label>
                        <input
                            type="number"
                            id="length"
                            name="length"
                            value={measurements.length}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" className="btn btn-outline" onClick={onBack}>Back</button>
                    <button type="submit" className="btn btn-primary">Next Step</button>
                </div>
            </form>
        </div>
    );
}

import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import styles from './DesignCard.module.css';

interface DesignCardProps {
    id: string;
    title: string;
    category: string;
    image: string;
    price: string;
}

export default function DesignCard({ id, title, category, image, price }: DesignCardProps) {
    const { addToCart } = useCart();

    // URL encode the category for the link
    const categoryParam = encodeURIComponent(category);

    return (
        <div className={styles.card}>
            <Link href={`/customize/${categoryParam}`} className={styles.imageLink}>
                <div className={styles.imageContainer}>
                    <img src={image} alt={title} className={styles.image} />
                    <div className={styles.overlay}>
                        <span className={styles.customizeText}>Customize</span>
                    </div>
                </div>
            </Link>
            <div className={styles.info}>
                <span className={styles.category}>{category}</span>
                <Link href={`/customize/${categoryParam}`} className={styles.titleLink}>
                    <h3 className={styles.title}>{title}</h3>
                </Link>
                <div className={styles.bottomRow}>
                    <p className={styles.price}>{price}</p>
                    <button
                        className={styles.addToCartBtn}
                        onClick={(e) => {
                            e.preventDefault(); // Prevent navigation if clicked
                            const priceNum = parseInt(price.replace(/[^0-9]/g, '')) || 0;
                            addToCart({ id, title, category, image, price: priceNum });
                            alert('Added to cart!');
                        }}
                        title="Add to Cart"
                    >
                        <ShoppingBag size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

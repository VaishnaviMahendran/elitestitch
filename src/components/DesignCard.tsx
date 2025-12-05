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
    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={image} alt={title} className={styles.image} />
                <div className={styles.overlay}>
                    <div className={styles.actions}>
                        <Link href={`/order?design=${id}`} className={styles.selectBtn}>
                            Select <ArrowRight size={16} />
                        </Link>
                        <button
                            className={styles.addToCartBtn}
                            onClick={() => {
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
            <div className={styles.info}>
                <span className={styles.category}>{category}</span>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.price}>{price}</p>
            </div>
        </div>
    );
}

import { useEffect, useState, useRef } from 'react';

export function useIntersectionObserver(options = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
                // Once visible, stop observing to keep it visible (one-way animation)
                if (targetRef.current) {
                    observer.unobserve(targetRef.current);
                }
            }
        }, {
            threshold: 0.1,
            rootMargin: "0px",
            ...options
        });

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => {
            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }
        };
    }, [options]);

    return { targetRef, isIntersecting };
}

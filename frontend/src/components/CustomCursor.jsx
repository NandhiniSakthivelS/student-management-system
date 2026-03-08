import { useEffect, useState } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isHidden, setIsHidden] = useState(true);
    const [isMouseDown, setIsMouseDown] = useState(false);

    useEffect(() => {
        const onMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsHidden(false);

            // Subtle lag effect for the outer ring
            setTimeout(() => {
                setDotPosition({ x: e.clientX, y: e.clientY });
            }, 50);
        };

        const onMouseEnter = () => setIsHidden(false);
        const onMouseLeave = () => setIsHidden(true);
        const onMouseDown = () => setIsMouseDown(true);
        const onMouseUp = () => setIsMouseDown(false);

        const onMouseOver = (e) => {
            const target = e.target;
            const isClickable =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('.btn') ||
                target.closest('.card') ||
                target.closest('.stat-card') ||
                target.closest('.sidebar-item');

            setIsHovered(!!isClickable);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseenter', onMouseEnter);
        window.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mouseover', onMouseOver);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseenter', onMouseEnter);
            window.removeEventListener('mouseleave', onMouseLeave);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mouseover', onMouseOver);
        };
    }, []);

    return (
        <>
            {/* Outer Glowing Ring */}
            <div
                className={`cursor-ring ${isHidden ? 'hidden' : ''} ${isHovered ? 'hover' : ''} ${isMouseDown ? 'active' : ''}`}
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
            />
            {/* Inner Precise Dot */}
            <div
                className={`cursor-dot ${isHidden ? 'hidden' : ''} ${isHovered ? 'hover' : ''}`}
                style={{ left: `${dotPosition.x}px`, top: `${dotPosition.y}px` }}
            />
        </>
    );
}

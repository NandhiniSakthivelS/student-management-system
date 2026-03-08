import { useEffect, useState, useRef } from 'react';
import './IntroScreen.css';

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 6 + 2,
    dur: Math.random() * 4 + 3,
    delay: Math.random() * 4,
    color: ['#6366f1', '#8b5cf6', '#0ea5e9', '#f43f5e', '#10b981'][Math.floor(Math.random() * 5)],
}));

export default function IntroScreen({ onFinish }) {
    const [progress, setProgress] = useState(0);
    const [exiting, setExiting] = useState(false);
    const [statusText, setStatusText] = useState('Initializing System...');
    const intervalRef = useRef(null);

    const STEPS = [
        [0, 20, 'Connecting to Database...'],
        [20, 50, 'Loading Student Records...'],
        [50, 75, 'Syncing Modules...'],
        [75, 95, 'Almost Ready...'],
        [95, 100, 'Welcome! 🎓'],
    ];

    useEffect(() => {
        let current = 0;
        let stepIdx = 0;

        intervalRef.current = setInterval(() => {
            current += Math.random() * 3 + 1;
            if (current > 100) current = 100;
            setProgress(Math.floor(current));

            // Update status text based on progress
            const step = STEPS.find(([start, end]) => current >= start && current < end);
            if (step) setStatusText(step[2]);

            if (current >= 100) {
                clearInterval(intervalRef.current);
                setStatusText('Welcome! 🎓');
                setTimeout(() => {
                    setExiting(true);
                    setTimeout(onFinish, 800);
                }, 600);
            }
        }, 60);

        return () => clearInterval(intervalRef.current);
    }, []);

    return (
        <div className={`intro-screen ${exiting ? 'exiting' : ''}`}>
            {/* Background Image */}
            <div className="intro-bg-image-wrap">
                <img src="/login_hero.png" alt="" className="intro-bg-image" />
                <div className="intro-bg-overlay" />
            </div>

            {/* Grid Background */}
            <div className="intro-grid" />

            {/* Glowing Orbs */}
            <div className="intro-orb intro-orb-1" />
            <div className="intro-orb intro-orb-2" />
            <div className="intro-orb intro-orb-3" />

            {/* Particles */}
            <div className="intro-particles">
                {PARTICLES.map(p => (
                    <div
                        key={p.id}
                        className="particle"
                        style={{
                            left: `${p.x}%`,
                            width: p.size,
                            height: p.size,
                            background: p.color,
                            '--dur': `${p.dur}s`,
                            '--delay': `${p.delay}s`,
                            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="intro-content">
                {/* Logo */}
                <div className="intro-logo-wrap">
                    <div className="intro-logo-ring">
                        <div className="intro-logo-inner">🎓</div>
                    </div>
                </div>

                {/* Title */}
                <div className="intro-title-group">
                    <span className="intro-subtitle"></span>
                    <h1 className="intro-title">Student Management</h1>
                    <p className="intro-desc">
                        A powerful, modern platform for managing students, courses, attendance, grades and more — all in one place.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="intro-progress-wrap">
                    <div className="intro-progress-label">
                        <span>{statusText}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="intro-progress-track">
                        <div className="intro-progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Bounce Dots */}
                <div className="intro-dots">
                    <div className="intro-dot" />
                    <div className="intro-dot" />
                    <div className="intro-dot" />
                </div>

                {/* Tech Tags */}
                <div className="intro-features">
                    {['⚛️ React', '☕ Spring Boot', '🍃 MongoDB'].map(tech => (
                        <div className="intro-feature-chip" key={tech}>{tech}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

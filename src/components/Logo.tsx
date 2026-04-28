import logoII from '../assets/logo_II.png';

interface LogoProps {
    size?: number; // Scale factor (default: 1)
}

export default function Logo({ size = 1 }: LogoProps) {
    return (
        <div style={{ display: "flex", flexDirection:"column", alignItems: "center"}}> 
            <img src={logoII} alt="Logo" style={{width: `${135 * size}px`, height: `${100 * size}px`}} /> 
            <h1 style ={{color: "var(--color-purple)", marginTop: `${10 * size}px`, textAlign: "center", fontSize: `${24 * size}px`}}>
                Dishly
            </h1>
        </div>
    );
}
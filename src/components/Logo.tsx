import logoII from "../assets/logo_II.png";

export default function Logo() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src={logoII} alt="Logo" style={{ width: "135px", height: "100px" }} />
            <h1 style={{ color: "var(--color-purple)", marginTop: "10px", textAlign: "center" }}>
                Dishly
            </h1>
        </div>
    );

}
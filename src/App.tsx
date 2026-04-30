import React from "react";
import { AppRoutes } from "./routes";
import DeleteButton from "./components/DeleteButton";
import Notification from "./components/Notification";

function App() {
  return (
    <>
      {/* Contenedor temporal de pruebas */}
      <div style={{ 
        position: 'fixed', 
        top: 20, 
        right: 20, 
        zIndex: 9999, 
        background: 'white', 
        padding: '20px', 
        border: '2px solid black',
        borderRadius: '10px' 
      }}>
        <DeleteButton label="Prova Borrar" onClick={() => alert("Funciona!")} />
        <Notification type="success" message="Provant notificació" />
      </div>

      <AppRoutes />
    </>
  );
}

export default App;

import { FaCar, FaMotorcycle, FaCheckCircle, } from "react-icons/fa";
import React, { useState } from 'react';

  
export default function Espacio({ numero, ocupado, tipo }) {
  return (
    
    <button 
      style={{
        width: "70px",
        height: "100px",
        borderRadius: "10px",
        backgroundColor: ocupado ? "#cb3634" : "#1f4e79",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        cursor: "pointer",
        transition: "transform 0.2s"
        
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
   onClick={(e) => e.currentTarget.style.backgroundColor="green"}
onDoubleClickCapture={(e) => e.currentTarget.style.backgroundColor="red"}

 
      
    >
  
      <div style={{ fontSize: "18px" }}>
        {tipo === "carro" ? <FaCar /> : <FaMotorcycle />}
      </div>

  
      <div style={{ fontSize: "18px" }}>
        {ocupado ? "❌" : <FaCheckCircle />}
      </div>

      <small>#{numero}</small>

      <small style={{ fontSize: "10px" }}>
        {ocupado ? "Ocupado" : "Libre"}
      </small>
    </button>
  );
}
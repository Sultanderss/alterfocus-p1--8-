import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SIMULATION_USER, SIMULATION_STATS, SIMULATION_VIRTUAL_ROOMS, SIMULATION_PHYSICAL_SESSIONS } from '../lib/simulationData';

interface SimulationContextType {
    isSimulationActive: boolean;
    toggleSimulation: () => void;
    simulatedData: any;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSimulationActive, setIsSimulationActive] = useState(false);

    const toggleSimulation = () => {
        setIsSimulationActive(prev => !prev);
    };

    const simulatedData = isSimulationActive ? {
        user: SIMULATION_USER,
        stats: SIMULATION_STATS,
        virtualRooms: SIMULATION_VIRTUAL_ROOMS,
        physicalSessions: SIMULATION_PHYSICAL_SESSIONS
    } : null;

    return (
        <SimulationContext.Provider value={{ isSimulationActive, toggleSimulation, simulatedData }}>
            {children}
            {/* Simulation Banner */}
            {isSimulationActive && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white text-xs font-bold py-1 px-4 text-center shadow-lg flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        🚧 MODO SIMULACIÓN ACTIVO - Datos Ficticios
                    </span>
                    <button
                        onClick={toggleSimulation}
                        className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] transition-colors"
                    >
                        SALIR
                    </button>
                </div>
            )}
        </SimulationContext.Provider>
    );
};

export const useSimulation = () => {
    const context = useContext(SimulationContext);
    if (!context) {
        throw new Error('useSimulation must be used within a SimulationProvider');
    }
    return context;
};

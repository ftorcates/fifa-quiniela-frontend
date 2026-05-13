import { useState, useMemo, useCallback } from 'react';

interface FictionalResult {
  home: number;
  away: number;
  isSimulated: boolean;
}

export const useSimulator = (initialMatches: any[], allTickets: any[]) => {
  // Guardamos solo los cambios que el usuario hace en los marcadores
  const [fictionalResults, setFictionalResults] = useState<Record<string, FictionalResult>>({});

  const updateFictionalResult = useCallback((matchId: string, home: number, away: number) => {
    // Validar que no sean negativos
    const cleanHome = Math.max(0, parseInt(String(home)) || 0);
    const cleanAway = Math.max(0, parseInt(String(away)) || 0);
    
    setFictionalResults(prev => ({ 
      ...prev, 
      [matchId]: { 
        home: cleanHome, 
        away: cleanAway,
        isSimulated: true 
      } 
    }));
  }, []);

  // Resetear un partido específico
  const resetMatch = useCallback((matchId: string) => {
    setFictionalResults(prev => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
  }, []);

  // Resetear todo
  const resetAll = useCallback(() => {
    setFictionalResults({});
  }, []);

  // El Ranking se recalcula automáticamente cada vez que cambia un resultado ficticio
  const simulatedRanking = useMemo(() => {
    if (allTickets.length === 0) return [];

    return allTickets.map((ticket, idx) => {
      let totalPoints = 0;
      let realPoints = 0;

      // Iteramos sobre todos los partidos para este ticket
      Object.keys(ticket.predictions || {}).forEach(matchId => {
        const match = initialMatches.find(m => m.id === matchId);
        if (!match) return;

        // Resultado real (si está disponible)
        const realResult = match.isFinished 
          ? { home: match.homeScore, away: match.awayScore } 
          : null;

        // Resultado para simular (prioridad: ficticio > real)
        const simulatedResult = fictionalResults[matchId] || realResult;

        if (simulatedResult) {
          totalPoints += calculatePoints(ticket.predictions[matchId], simulatedResult);
          
          // Calcular puntos reales solo si el partido terminó
          if (realResult) {
            realPoints += calculatePoints(ticket.predictions[matchId], realResult);
          }
        }
      });

      // Obtener puntos reales del ranking si existe
      const realPointsFromRanking = ticket.rankings?.[0]?.points || 0;

      return { 
        ...ticket, 
        index: idx,
        simulatedPoints: totalPoints,
        realPoints: realPointsFromRanking || realPoints,
        diff: totalPoints - (realPointsFromRanking || realPoints)
      };
    }).sort((a, b) => b.simulatedPoints - a.simulatedPoints);
  }, [fictionalResults, initialMatches, allTickets]);

  // Contar cuántos partidos han sido modificados
  const modifiedCount = Object.keys(fictionalResults).length;

  return { 
    fictionalResults, 
    updateFictionalResult, 
    simulatedRanking,
    resetMatch,
    resetAll,
    modifiedCount
  };
};

// Función helper (Reutiliza tu lógica de 3, 2, 1 pts)
function calculatePoints(pred: any, res: any): number {
  // 3 pts: Resultado exacto (incluyendo empate)
  if (pred.home === res.home && pred.away === res.away) {
    return pred.home === pred.away ? 2 : 3;
  }
  // 1 pt: Solo acertó que fue empate
  if (res.home === res.away && pred.home === pred.away) {
    return 1;
  }
  // 2 pts: Acertó ganador y diferencia de goles
  const winnerMatch = (res.home > res.away && pred.home > pred.away) || 
                      (res.away > res.home && pred.away > pred.home);
  if (winnerMatch) {
    return Math.abs(pred.home - pred.away) === Math.abs(res.home - res.away) ? 2 : 1;
  }
  // 0 pts: Sin coincidencia
  return 0;
}

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const CREATE_GAME = gql`
  mutation CreateGame($gameType: String, $aiDifficulty: String) {
    createGame(gameType: $gameType, aiDifficulty: $aiDifficulty) {
      id
      status
      currentPlayer
      gameType
      aiDifficulty
      aiColor
      pieces {
        type
        color
        row
        col
        hasMoved
      }
    }
  }
`;

const GameModal = ({ type, isVisible, onOk, onPlayAgain, onMainMenu, winner, onGameCreated }) => {
  const [gameType, setGameType] = useState('HUMAN_VS_HUMAN');
  const [aiDifficulty, setAiDifficulty] = useState('NORMAL');
  const [createGame, { loading: creatingGame }] = useMutation(CREATE_GAME);

  const handleCreateGame = async () => {
    try {
      const result = await createGame({
        variables: {
          gameType: gameType,
          aiDifficulty: gameType === 'HUMAN_VS_AI' ? aiDifficulty : null
        }
      });
      
      if (result.data?.createGame) {
        onGameCreated(result.data.createGame);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handlePlayAgain = async () => {
    await handleCreateGame();
    onPlayAgain();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          {type === 'check' && (
            <>
              <h2>Check!</h2>
              <p>Your king is in check. You must move to safety.</p>
              <button onClick={onOk} className="modal-button">OK</button>
            </>
          )}

          {type === 'checkmate' && (
            <>
              <h2>Checkmate!</h2>
              <p>{winner ? `${winner} wins the game!` : 'Game Over! The winner has been decided.'}</p>
              <div className="modal-buttons">
                <button onClick={handlePlayAgain} className="modal-button" disabled={creatingGame}>
                  {creatingGame ? 'Creating...' : 'Play Again'}
                </button>
                <button onClick={onMainMenu} className="modal-button">Main Menu</button>
              </div>
            </>
          )}

          {type === 'newGame' && (
            <>
              <h2>New Chess Game</h2>
              
              <div className="game-options">
                <div className="option-group">
                  <label className="option-label">Game Type:</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        value="HUMAN_VS_HUMAN"
                        checked={gameType === 'HUMAN_VS_HUMAN'}
                        onChange={(e) => setGameType(e.target.value)}
                      />
                      Human vs Human
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        value="HUMAN_VS_AI"
                        checked={gameType === 'HUMAN_VS_AI'}
                        onChange={(e) => setGameType(e.target.value)}
                      />
                      Human vs AI
                    </label>
                  </div>
                </div>

                {gameType === 'HUMAN_VS_AI' && (
                  <div className="option-group">
                    <label className="option-label">AI Difficulty:</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="difficulty-select"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="HARD">Hard</option>
                      <option value="IMPOSSIBLE">Impossible</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-buttons">
                <button 
                  onClick={handleCreateGame} 
                  className="modal-button primary"
                  disabled={creatingGame}
                >
                  {creatingGame ? 'Creating...' : 'Start Game'}
                </button>
                <button onClick={onMainMenu} className="modal-button">Cancel</button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          text-align: center;
          min-width: 300px;
          max-width: 400px;
        }

        .modal-content h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 24px;
        }

        .modal-content p {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 16px;
          line-height: 1.4;
        }

        .game-options {
          margin: 20px 0;
          text-align: left;
        }

        .option-group {
          margin-bottom: 20px;
        }

        .option-label {
          display: block;
          margin-bottom: 10px;
          font-weight: bold;
          color: #333;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
          cursor: pointer;
        }

        .radio-option input[type="radio"] {
          cursor: pointer;
        }

        .difficulty-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background-color: white;
        }

        .modal-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          margin: 0 5px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .modal-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .modal-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .modal-button.primary {
          background-color: #28a745;
        }

        .modal-button.primary:hover:not(:disabled) {
          background-color: #218838;
        }

        .modal-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
      `}</style>
    </>
  );
};

export default GameModal;
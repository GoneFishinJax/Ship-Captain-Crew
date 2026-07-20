// Ship, Captain, and Crew Game
// A dice game where players try to roll 6 (Ship), 5 (Captain), and 4 (Crew)

class ShipCaptainCrew {
    constructor() {
        // Game state
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;
        this.currentPlayer = 'player'; // 'player' or 'computer'
        this.rollsRemaining = 3;
        this.playerDice = [0, 0, 0, 0, 0];
        this.computerDice = [0, 0, 0, 0, 0];
        this.keptDice = [];
        this.selectedIndices = [];
        this.hasShipCaptainCrew = false;
        this.gameOver = false;
        
        // DOM elements
        this.playerScoreEl = document.getElementById('player-score');
        this.computerScoreEl = document.getElementById('computer-score');
        this.playerTurnScoreEl = document.getElementById('player-turn-score');
        this.computerTurnScoreEl = document.getElementById('computer-turn-score');
        this.gameStatusEl = document.getElementById('game-status');
        this.roundNumberEl = document.getElementById('round-number');
        this.rollsRemainingEl = document.getElementById('rolls-remaining');
        this.rollBtn = document.getElementById('roll-btn');
        this.keepBtn = document.getElementById('keep-btn');
        this.endTurnBtn = document.getElementById('end-turn-btn');
        
        // Player dice elements
        this.playerDiceEls = [];
        for (let i = 0; i < 5; i++) {
            this.playerDiceEls.push(document.getElementById(`player-die-${i}`));
        }
        
        // Computer dice elements
        this.computerDiceEls = [];
        for (let i = 0; i < 5; i++) {
            this.computerDiceEls.push(document.getElementById(`computer-die-${i}`));
        }
        
        // Event listeners
        this.setupEventListeners();
        
        // Initialize game
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Roll button
        this.rollBtn.addEventListener('click', () => this.rollDice());
        
        // Keep button
        this.keepBtn.addEventListener('click', () => this.keepSelectedDice());
        
        // End turn button
        this.endTurnBtn.addEventListener('click', () => this.endTurn());
        
        // Dice selection - only for player's turn
        this.playerDiceEls.forEach((dieEl, index) => {
            dieEl.addEventListener('click', () => {
                if (this.currentPlayer === 'player' && !this.gameOver) {
                    this.toggleDieSelection(index);
                }
            });
        });
    }
    
    toggleDieSelection(index) {
        // Can only select dice that are not already kept
        const dieEl = this.playerDiceEls[index];
        
        if (dieEl.classList.contains('kept')) {
            return; // Already kept, can't deselect
        }
        
        // Toggle selection
        if (this.selectedIndices.includes(index)) {
            this.selectedIndices = this.selectedIndices.filter(i => i !== index);
            dieEl.classList.remove('selected');
        } else {
            this.selectedIndices.push(index);
            dieEl.classList.add('selected');
        }
        
        // Enable/disable keep button based on selection
        this.keepBtn.disabled = this.selectedIndices.length === 0;
    }
    
    rollDice() {
        if (this.gameOver || this.rollsRemaining <= 0) return;
        
        // Disable roll button during animation
        this.rollBtn.disabled = true;
        
        // Add rolling animation
        if (this.currentPlayer === 'player') {
            this.playerDiceEls.forEach(el => {
                if (!el.classList.contains('kept')) {
                    el.classList.add('rolling');
                    el.textContent = '?';
                }
            });
        } else {
            this.computerDiceEls.forEach(el => {
                if (!el.classList.contains('kept')) {
                    el.classList.add('rolling');
                    el.textContent = '?';
                }
            });
        }
        
        // Simulate rolling animation
        setTimeout(() => {
            if (this.currentPlayer === 'player') {
                this.rollPlayerDice();
            } else {
                this.rollComputerDice();
            }
            
            // Remove rolling class
            document.querySelectorAll('.dice.rolling').forEach(el => {
                el.classList.remove('rolling');
            });
            
            this.rollBtn.disabled = false;
        }, 1000);
    }
    
    rollPlayerDice() {
        // Roll only the dice that are not kept
        for (let i = 0; i < 5; i++) {
            if (!this.playerDiceEls[i].classList.contains('kept')) {
                this.playerDice[i] = this.rollSingleDie();
            }
        }
        
        this.rollsRemaining--;
        this.updateDisplay();
        
        // Check if player has ship, captain, crew
        this.checkShipCaptainCrew('player');
        
        // If no rolls remaining or has ship/captain/crew, enable end turn
        if (this.rollsRemaining <= 0 || this.hasShipCaptainCrew) {
            this.endTurnBtn.disabled = false;
        }
        
        // If has ship/captain/crew, auto-end turn after a delay
        if (this.hasShipCaptainCrew) {
            setTimeout(() => {
                if (this.currentPlayer === 'player' && this.hasShipCaptainCrew) {
                    this.endTurn();
                }
            }, 1500);
        }
    }
    
    rollComputerDice() {
        // Computer AI: decide which dice to keep
        if (this.rollsRemaining === 2) {
            // First roll - keep ship, captain, crew if present
            this.computerSelectDice();
        }
        
        // Roll only the dice that are not kept
        for (let i = 0; i < 5; i++) {
            if (!this.computerDiceEls[i].classList.contains('kept')) {
                this.computerDice[i] = this.rollSingleDie();
            }
        }
        
        this.rollsRemaining--;
        this.updateDisplay();
        
        // Check if computer has ship, captain, crew
        this.checkShipCaptainCrew('computer');
        
        // Computer AI: decide whether to keep more dice or end turn
        if (this.rollsRemaining > 0 && !this.hasShipCaptainCrew) {
            // Computer will always try to keep more dice if it doesn't have ship/captain/crew
            setTimeout(() => {
                this.computerSelectDice();
                if (this.rollsRemaining > 0) {
                    this.rollDice(); // Continue rolling
                }
            }, 1000);
        } else if (this.rollsRemaining <= 0 || this.hasShipCaptainCrew) {
            // End computer's turn
            setTimeout(() => {
                this.endTurn();
            }, 1500);
        }
    }
    
    computerSelectDice() {
        // Computer AI logic to select which dice to keep
        const dice = this.computerDice;
        const keptIndices = [];
        
        // Always keep ship (6), captain (5), crew (4)
        for (let i = 0; i < 5; i++) {
            if (!this.computerDiceEls[i].classList.contains('kept')) {
                if (dice[i] === 6 || dice[i] === 5 || dice[i] === 4) {
                    keptIndices.push(i);
                }
            }
        }
        
        // If we have ship, captain, crew, we're done
        const hasShip = dice.includes(6);
        const hasCaptain = dice.includes(5);
        const hasCrew = dice.includes(4);
        
        if (hasShip && hasCaptain && hasCrew) {
            // Keep all ship, captain, crew
            this.keepComputerDice(keptIndices);
            return;
        }
        
        // If we have two of ship, captain, crew, keep them
        if ((hasShip && hasCaptain) || (hasShip && hasCrew) || (hasCaptain && hasCrew)) {
            this.keepComputerDice(keptIndices);
            return;
        }
        
        // If we have one of ship, captain, crew, keep it
        if (hasShip || hasCaptain || hasCrew) {
            this.keepComputerDice(keptIndices);
            return;
        }
        
        // If we have high numbers (3+), keep them for potential score
        const highDiceIndices = [];
        for (let i = 0; i < 5; i++) {
            if (!this.computerDiceEls[i].classList.contains('kept') && dice[i] >= 3) {
                highDiceIndices.push(i);
            }
        }
        
        if (highDiceIndices.length > 0) {
            this.keepComputerDice(highDiceIndices);
        }
    }
    
    keepComputerDice(indices) {
        // Mark computer dice as kept
        indices.forEach(index => {
            this.computerDiceEls[index].classList.add('kept');
            
            // Add special classes for ship, captain, crew
            if (this.computerDice[index] === 6) {
                this.computerDiceEls[index].classList.add('ship');
            } else if (this.computerDice[index] === 5) {
                this.computerDiceEls[index].classList.add('captain');
            } else if (this.computerDice[index] === 4) {
                this.computerDiceEls[index].classList.add('crew');
            }
        });
    }
    
    keepSelectedDice() {
        if (this.selectedIndices.length === 0 || this.currentPlayer !== 'player') return;
        
        // Mark selected dice as kept
        this.selectedIndices.forEach(index => {
            this.playerDiceEls[index].classList.add('kept');
            this.playerDiceEls[index].classList.remove('selected');
            
            // Add special classes for ship, captain, crew
            if (this.playerDice[index] === 6) {
                this.playerDiceEls[index].classList.add('ship');
            } else if (this.playerDice[index] === 5) {
                this.playerDiceEls[index].classList.add('captain');
            } else if (this.playerDice[index] === 4) {
                this.playerDiceEls[index].classList.add('crew');
            }
        });
        
        // Clear selection
        this.selectedIndices = [];
        this.keepBtn.disabled = true;
        
        // Check if player has ship, captain, crew
        this.checkShipCaptainCrew('player');
        
        // If has ship/captain/crew, enable end turn
        if (this.hasShipCaptainCrew) {
            this.endTurnBtn.disabled = false;
        }
    }
    
    checkShipCaptainCrew(player) {
        const dice = player === 'player' ? this.playerDice : this.computerDice;
        const diceEls = player === 'player' ? this.playerDiceEls : this.computerDiceEls;
        
        const hasShip = dice.some((val, idx) => val === 6 && diceEls[idx].classList.contains('kept'));
        const hasCaptain = dice.some((val, idx) => val === 5 && diceEls[idx].classList.contains('kept'));
        const hasCrew = dice.some((val, idx) => val === 4 && diceEls[idx].classList.contains('kept'));
        
        this.hasShipCaptainCrew = hasShip && hasCaptain && hasCrew;
        
        // Highlight the ship, captain, crew dice
        if (this.hasShipCaptainCrew) {
            diceEls.forEach((el, idx) => {
                if (dice[idx] === 6 && el.classList.contains('kept')) {
                    el.classList.add('ship', 'special');
                } else if (dice[idx] === 5 && el.classList.contains('kept')) {
                    el.classList.add('captain', 'special');
                } else if (dice[idx] === 4 && el.classList.contains('kept')) {
                    el.classList.add('crew', 'special');
                }
            });
        }
    }
    
    endTurn() {
        if (this.gameOver) return;
        
        let turnScore = 0;
        
        if (this.currentPlayer === 'player') {
            // Calculate player's turn score
            if (this.hasShipCaptainCrew) {
                // Sum all non-kept dice
                this.playerDice.forEach((val, idx) => {
                    if (!this.playerDiceEls[idx].classList.contains('kept')) {
                        turnScore += val;
                    }
                });
                this.playerScore += turnScore;
                this.playerTurnScoreEl.textContent = turnScore;
            } else {
                // No ship, captain, crew - score 0
                this.playerTurnScoreEl.textContent = '0';
            }
            
            // Switch to computer
            this.currentPlayer = 'computer';
            this.gameStatusEl.innerHTML = '<p>Computer\'s turn...</p>';
            
            // Reset computer dice
            this.computerDice = [0, 0, 0, 0, 0];
            this.computerDiceEls.forEach(el => {
                el.classList.remove('kept', 'ship', 'captain', 'crew', 'special');
                el.textContent = '?';
            });
            
            // Reset state for computer's turn
            this.rollsRemaining = 3;
            this.hasShipCaptainCrew = false;
            this.computerTurnScoreEl.textContent = '0';
            
            // Computer takes its turn
            setTimeout(() => {
                this.rollDice();
            }, 1000);
            
        } else {
            // Calculate computer's turn score
            if (this.hasShipCaptainCrew) {
                // Sum all non-kept dice
                this.computerDice.forEach((val, idx) => {
                    if (!this.computerDiceEls[idx].classList.contains('kept')) {
                        turnScore += val;
                    }
                });
                this.computerScore += turnScore;
                this.computerTurnScoreEl.textContent = turnScore;
            } else {
                // No ship, captain, crew - score 0
                this.computerTurnScoreEl.textContent = '0';
            }
            
            // Switch back to player for next round
            this.currentPlayer = 'player';
            this.currentRound++;
            
            // Check for game over (after 5 rounds)
            if (this.currentRound > 5) {
                this.endGame();
                return;
            }
            
            // Reset for next round
            this.gameStatusEl.innerHTML = `<p>Your turn! Click "Roll Dice" to start Round ${this.currentRound}.</p>`;
            
            // Reset player dice
            this.playerDice = [0, 0, 0, 0, 0];
            this.playerDiceEls.forEach(el => {
                el.classList.remove('kept', 'selected', 'ship', 'captain', 'crew', 'special');
                el.textContent = '?';
            });
            
            // Reset state
            this.selectedIndices = [];
            this.rollsRemaining = 3;
            this.hasShipCaptainCrew = false;
            this.playerTurnScoreEl.textContent = '0';
        }
        
        // Update buttons
        this.rollBtn.disabled = this.currentPlayer !== 'player';
        this.keepBtn.disabled = true;
        this.endTurnBtn.disabled = true;
        
        this.updateDisplay();
    }
    
    endGame() {
        this.gameOver = true;
        
        let winner = '';
        if (this.playerScore > this.computerScore) {
            winner = 'You win!';
        } else if (this.computerScore > this.playerScore) {
            winner = 'Computer wins!';
        } else {
            winner = 'It\'s a tie!';
        }
        
        // Create game over overlay
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>Game Over!</h2>
            <p>${winner}</p>
            <p>Final Score: You ${this.playerScore} - ${this.computerScore} Computer</p>
            <button id="play-again-btn" class="btn">Play Again</button>
        `;
        
        document.body.appendChild(gameOverDiv);
        
        // Play again button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            gameOverDiv.remove();
            this.resetGame();
        });
    }
    
    resetGame() {
        // Reset all game state
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;
        this.currentPlayer = 'player';
        this.rollsRemaining = 3;
        this.playerDice = [0, 0, 0, 0, 0];
        this.computerDice = [0, 0, 0, 0, 0];
        this.keptDice = [];
        this.selectedIndices = [];
        this.hasShipCaptainCrew = false;
        this.gameOver = false;
        
        // Reset all dice elements
        this.playerDiceEls.forEach(el => {
            el.classList.remove('kept', 'selected', 'ship', 'captain', 'crew', 'special');
            el.textContent = '?';
        });
        
        this.computerDiceEls.forEach(el => {
            el.classList.remove('kept', 'selected', 'ship', 'captain', 'crew', 'special');
            el.textContent = '?';
        });
        
        // Reset buttons
        this.rollBtn.disabled = false;
        this.keepBtn.disabled = true;
        this.endTurnBtn.disabled = true;
        
        // Update display
        this.updateDisplay();
        this.gameStatusEl.innerHTML = '<p>Your turn! Click "Roll Dice" to start.</p>';
    }
    
    rollSingleDie() {
        return Math.floor(Math.random() * 6) + 1;
    }
    
    updateDisplay() {
        // Update scores
        this.playerScoreEl.textContent = this.playerScore;
        this.computerScoreEl.textContent = this.computerScore;
        
        // Update round info
        this.roundNumberEl.textContent = this.currentRound;
        this.rollsRemainingEl.textContent = this.rollsRemaining;
        
        // Update dice displays
        this.playerDice.forEach((val, idx) => {
            if (!this.playerDiceEls[idx].classList.contains('kept')) {
                this.playerDiceEls[idx].textContent = val === 0 ? '?' : val;
            }
        });
        
        this.computerDice.forEach((val, idx) => {
            if (!this.computerDiceEls[idx].classList.contains('kept')) {
                this.computerDiceEls[idx].textContent = val === 0 ? '?' : val;
            }
        });
        
        // Update button states based on current player
        this.rollBtn.disabled = this.currentPlayer !== 'player' || this.gameOver;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ShipCaptainCrew();
});

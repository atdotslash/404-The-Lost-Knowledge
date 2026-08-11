/**
 * 404: The Lost Knowledge - Core Game Mechanics & Hardware Physics
 * Lead Game Programmer Module
 * 
 * Includes:
 * 1. Memory Management System (OS Level Memory Leak Simulation & Data Integrity)
 * 2. Interrupt & Recovery Handler (Collectible Collisions)
 * 3. Legacy Hardware Physics Engine:
 *    - 3½ Floppy Disk Ballistic Trajectory (Parabolic with Gravity)
 *    - USB Pendrive High-Speed Rectilinear Trajectory
 */

(function (global) {
  'use strict';

  // ==========================================
  // 1. MEMORY MANAGEMENT (DATA INTEGRITY LEAK)
  // ==========================================
  class MemoryManager {
    /**
     * @param {number} initialIntegrity Initial integrity value (0.0 to 100.0)
     * @param {number} baseLeakRate Leak rate percentage per second
     */
    constructor(initialIntegrity = 100.0, baseLeakRate = 2.5) {
      this.Integridad_Datos = Math.min(100.0, Math.max(0.0, initialIntegrity));
      this.baseLeakRate = baseLeakRate; // Degradation rate per second (%)
      this.leakMultiplier = 1.0;       // Escalates with OS memory fragmentation
      this.fragmentationFactor = 0.05; // Rate at which memory leak accelerates over time
      this.maxIntegrity = 100.0;
      this.criticalThreshold = 20.0;
    }

    /**
     * Update loop to simulate system-level memory leak (degradation over time)
     * @param {number} deltaTime Time elapsed since last frame in seconds
     * @param {object} [runtimeScene] Optional GDevelop runtimeScene instance
     */
    updateMemoryLeak(deltaTime, runtimeScene = null) {
      if (deltaTime <= 0 || this.Integridad_Datos <= 0) {
        return this.getStatus();
      }

      // Accelerate memory fragmentation leak over time
      this.leakMultiplier += this.fragmentationFactor * deltaTime;

      // Calculate memory leak decay
      const decayDelta = this.baseLeakRate * this.leakMultiplier * deltaTime;
      this.Integridad_Datos = Math.max(0.0, this.Integridad_Datos - decayDelta);

      // Sync with GDevelop global variable if runtimeScene is provided
      if (runtimeScene && runtimeScene.getGame) {
        const globalVars = runtimeScene.getGame().getVariables();
        if (globalVars.has('Integridad_Datos')) {
          globalVars.get('Integridad_Datos').setNumber(this.Integridad_Datos);
        }
      }

      return this.getStatus();
    }

    /**
     * Collision interrupt function to restore Integridad_Datos upon picking collectibles
     * @param {string} type Collectible item type ('RAM_STICK', 'CACHE_CLEANER', 'DEFRAG_PATCH')
     * @param {number} [customAmount] Optional override recovery value
     * @param {object} [runtimeScene] Optional GDevelop runtimeScene instance
     */
    onCollectibleCollision(type = 'RAM_STICK', customAmount = null, runtimeScene = null) {
      let recoveryAmount = 15.0;

      if (customAmount !== null && customAmount !== undefined) {
        recoveryAmount = customAmount;
      } else {
        switch (type.toUpperCase()) {
          case 'RAM_STICK':
            recoveryAmount = 25.0;
            break;
          case 'CACHE_CLEANER':
            recoveryAmount = 15.0;
            break;
          case 'DEFRAG_PATCH':
            recoveryAmount = 45.0;
            break;
          default:
            recoveryAmount = 10.0;
            break;
        }
      }

      const previousIntegrity = this.Integridad_Datos;
      this.Integridad_Datos = Math.min(this.maxIntegrity, this.Integridad_Datos + recoveryAmount);

      // Garbage collection effect: reduce leak multiplier upon defrag/RAM restoration
      this.leakMultiplier = Math.max(1.0, this.leakMultiplier - 0.25);

      // Sync with GDevelop global variable
      if (runtimeScene && runtimeScene.getGame) {
        const globalVars = runtimeScene.getGame().getVariables();
        if (globalVars.has('Integridad_Datos')) {
          globalVars.get('Integridad_Datos').setNumber(this.Integridad_Datos);
        }
      }

      return {
        event: 'INTERRUPT_MEMORY_RESTORED',
        collectibleType: type,
        restoredAmount: this.Integridad_Datos - previousIntegrity,
        currentIntegrity: this.Integridad_Datos,
        leakMultiplier: this.leakMultiplier
      };
    }

    /**
     * Get current integrity status
     */
    getStatus() {
      return {
        integrity: Number(this.Integridad_Datos.toFixed(2)),
        isCritical: this.Integridad_Datos <= this.criticalThreshold,
        isKernelPanic: this.Integridad_Datos <= 0.0,
        leakMultiplier: Number(this.leakMultiplier.toFixed(3))
      };
    }
  }

  // ==========================================
  // 2. LEGACY HARDWARE PHYSICS (PROJECTILES)
  // ==========================================
  class LegacyHardwarePhysics {
    /**
     * Calculates position and velocity for 3½ Floppy Disk (Disquete de 3½)
     * Trajectory: Parabolic path with gravity influence
     * 
     * @param {number} x0 Initial X coordinate
     * @param {number} y0 Initial Y coordinate
     * @param {number} v0 Initial launch velocity magnitude (px/s)
     * @param {number} angleDegrees Launch angle in degrees (0 = right, 90 = down, -45 = up-right in screen space)
     * @param {number} timeElapsed Time since launch in seconds (t)
     * @param {number} [gravity=980] Gravitational acceleration (px/s²)
     */
    static calculateFloppyTrajectory(x0, y0, v0, angleDegrees, timeElapsed, gravity = 980) {
      const angleRad = (angleDegrees * Math.PI) / 180;
      const v0x = v0 * Math.cos(angleRad);
      const v0y = v0 * Math.sin(angleRad);

      // Kinematic equations for parabolic motion
      const currentX = x0 + v0x * timeElapsed;
      const currentY = y0 + v0y * timeElapsed + 0.5 * gravity * Math.pow(timeElapsed, 2);

      // Instantaneous velocity vector components
      const vx = v0x;
      const vy = v0y + gravity * timeElapsed;

      // Dynamic rotation angle based on flight direction
      const currentAngleRad = Math.atan2(vy, vx);
      const currentAngleDegrees = (currentAngleRad * 180) / Math.PI;

      return {
        x: currentX,
        y: currentY,
        vx: vx,
        vy: vy,
        rotationAngle: currentAngleDegrees,
        timeElapsed: timeElapsed,
        type: '3.5_FLOPPY_DISK'
      };
    }

    /**
     * Calculates position and velocity for USB Pendrive
     * Trajectory: High-speed rectilinear trajectory (zero gravity)
     * 
     * @param {number} x0 Initial X coordinate
     * @param {number} y0 Initial Y coordinate
     * @param {number} speed Constant high-speed velocity (px/s)
     * @param {number} angleDegrees Launch direction angle in degrees
     * @param {number} timeElapsed Time since launch in seconds (t)
     * @param {number} [acceleration=0] Optional acceleration burst (e.g. USB 3.0 overdrive)
     */
    static calculateUSBPendriveTrajectory(x0, y0, speed, angleDegrees, timeElapsed, acceleration = 0) {
      const angleRad = (angleDegrees * Math.PI) / 180;
      
      // Effective velocity considering optional linear acceleration boost
      const effectiveSpeed = speed + acceleration * timeElapsed;
      
      const vx = effectiveSpeed * Math.cos(angleRad);
      const vy = effectiveSpeed * Math.sin(angleRad);

      // Linear distance equation: d = v0*t + 0.5*a*t^2
      const distance = speed * timeElapsed + 0.5 * acceleration * Math.pow(timeElapsed, 2);

      const currentX = x0 + distance * Math.cos(angleRad);
      const currentY = y0 + distance * Math.sin(angleRad);

      return {
        x: currentX,
        y: currentY,
        vx: vx,
        vy: vy,
        rotationAngle: angleDegrees,
        timeElapsed: timeElapsed,
        type: 'USB_PENDRIVE'
      };
    }
  }

  // ==========================================
  // EXPORT MODULE (Node.js & Browser / GDevelop)
  // ==========================================
  const CoreMechanics = {
    MemoryManager,
    LegacyHardwarePhysics
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreMechanics;
  } else {
    global.CoreMechanics = CoreMechanics;
  }
})(typeof window !== 'undefined' ? window : globalThis);

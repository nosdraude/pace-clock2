const workouts = [];
let currentWorkoutIndex = 0;
let currentRep = 0;
let isRunning = false;
let timer;
let timeLeft;
let phase = '';
const timerDisplay = document.getElementById("timer");
const phaseDisplay = document.getElementById("phase");
const workoutStatusDisplay = document.getElementById("workoutStatus");

const startSound = new Audio('start.mp3');
const goalEndSound = new Audio('end_goal.mp3');
const restEndSound = new Audio('end_rest.mp3');

function addWorkout() {
  const reps = parseInt(document.getElementById("reps").value);
  const goal = parseInt(document.getElementById("goal").value);
  const rest = parseInt(document.getElementById("rest").value);
  const setRest = parseInt(document.getElementById("setRest").value) || 0;
  const type = document.getElementById("type").value;

  if (!reps || !goal || !rest) return alert("Please fill all fields");

  workouts.push({
    type,
    reps,
    goalTime: goal,
    restTime: rest,
    setRest: setRest
  });

  updateWorkoutList();
}

function updateWorkoutList() {
  const ul = document.getElementById("workouts");
  ul.innerHTML = "";
  workouts.forEach((w, index) => {
    const li = document.createElement("li");
    li.textContent = `${w.type} - ${w.reps}x ${w.goalTime}s + ${w.restTime}s rest`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => {
      workouts.splice(index, 1);
      updateWorkoutList();
    };
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
}

function start() {
  if (workouts.length === 0 || isRunning) return;
  isRunning = true;
  currentWorkoutIndex = 0;
  currentRep = 0;
  runWorkout();
}

function stop() {
  clearInterval(timer);
  isRunning = false;
  phase = 'Stopped';
  phaseDisplay.textContent = `Phase: ${phase}`;
}

function reset() {
  stop();
  workouts.length = 0;
  currentWorkoutIndex = 0;
  currentRep = 0;
  phase = '';
  timerDisplay.textContent = "00:00";
  phaseDisplay.textContent = "Phase: -";
  workoutStatusDisplay.textContent = "Workout: -, Rep: -";
  updateWorkoutList();
}

function runWorkout() {
  const workout = workouts[currentWorkoutIndex];
  if (!workout) {
    isRunning = false;
    phaseDisplay.textContent = "Finished";
    return;
  }

  runInterval(workout, () => {
    if (workout.setRest > 0) {
      phase = 'Rest Between Sets';
      phaseDisplay.textContent = `Phase: ${phase}`;
      timeLeft = workout.setRest;
      startSound.play();
      runTimer(workout.setRest, () => {
        currentWorkoutIndex++;
        currentRep = 0;
        runWorkout();
      });
    } else {
      currentWorkoutIndex++;
      currentRep = 0;
      runWorkout();
    }
  });
}

function runInterval(workout, onComplete) {
  const interval = () => {
    if (currentRep >= workout.reps) {
      onComplete();
      return;
    }

    phase = 'Goal Time';
    phaseDisplay.textContent = `Phase: ${phase}`;
    workoutStatusDisplay.textContent = `Workout: ${workout.type}, Rep: ${currentRep + 1}/${workout.reps}`;
    startSound.play();
    runTimer(workout.goalTime, () => {
      goalEndSound.play();
      phase = 'Rest Time';
      phaseDisplay.textContent = `Phase: ${phase}`;
      runTimer(workout.restTime, () => {
        restEndSound.play();
        currentRep++;
        interval();
      });
    });
  };

  interval();
}

function runTimer(duration, callback) {
  clearInterval(timer);
  timeLeft = duration;
  updateTimerDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      callback();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  timerDisplay.textContent = `${mins}:${secs}`;
}

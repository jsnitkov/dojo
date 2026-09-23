"use strict";
/* Program data: the built-in rotation and the exercise-photo map.
   Loaded by index.html AND imported by sw.js (to precache photos), so keep it DOM-free. */

const BUILTIN = {"name": "Dojo EMS Program", "version": 2, "impulse": {"on": 6, "off": 4}, "days": [{"name": "Day 1 - Push Emphasis", "baseCounts": 2, "exercises": [{"name": "Goblet Squat", "counts": 8, "mode": "dynamic", "kit": "KB or DB at chest (or bodyweight)", "setup": "Feet shoulder-width, bell at chest, elbows inside knees", "cue": "Sink for 3s, drive up for 3s inside the impulse; stand tall and breathe on the 4s off", "load": "Bodyweight -> 20 lb KB -> 35 lb KB", "image": "Goblet Squat"}, {"name": "Push-Up", "counts": 8, "mode": "dynamic", "kit": "Bodyweight", "setup": "Hands under shoulders, knees down if needed", "cue": "Lower for 3s, press up for 3s; reset at the top on the 4s off", "load": "Knees -> full -> feet on a chair", "image": "Pushups"}, {"name": "Dumbbell Floor Press", "counts": 8, "mode": "dynamic", "kit": "Dumbbells", "setup": "Supine, knees bent, upper arms resting on the floor", "cue": "Press up for 3s, lower until the triceps touch for 3s; reset on the 4s off", "load": "The floor caps the range, so go heavier than a bench press", "image": "Dumbbell Floor Press"}, {"name": "Alternating Forward Lunge", "counts": 8, "mode": "dynamic", "kit": "Bodyweight or DBs", "setup": "Standing tall, hands on hips or bells hanging", "cue": "Step and lower for 3s, drive back up for 3s; switch legs on the 4s off", "load": "Bodyweight -> 15-25 lb DBs", "image": "Bodyweight Walking Lunge"}, {"name": "Standing Overhead Press", "counts": 8, "mode": "dynamic", "kit": "Band underfoot, or DBs/KBs", "setup": "Standing on the band centre, handles at shoulder height", "cue": "Press overhead for 3s, lower for 3s; reset at the shoulders on the 4s off", "load": "Band -> 15-25 lb DBs", "image": "Shoulder Press - With Bands"}, {"name": "Glute Bridge", "counts": 8, "mode": "squeeze", "kit": "Bodyweight, or DB/KB on hips", "setup": "Supine, knees bent, heels close to the glutes", "cue": "Drive up sharply and squeeze the glutes for the full 6s; lower slowly across the 4s off", "load": "Bodyweight -> KB across the hips", "image": "Butt Lift (Bridge)"}, {"name": "Triceps Kickback", "counts": 8, "mode": "squeeze", "kit": "Light dumbbells", "setup": "Hinged forward, elbows pinned high at your ribs", "cue": "Extend and lock out, hold the squeeze 6s; bend slowly across the 4s off", "load": "5-15 lb DBs; the upper arm never moves", "image": "Tricep Dumbbell Kickback"}, {"name": "Lateral Raise", "counts": 8, "mode": "dynamic", "kit": "Band underfoot, or light DBs", "setup": "Standing on the band, arms at sides, slight elbow bend", "cue": "Raise for 3s, lower for 3s; arms rest at your sides on the 4s off", "load": "Light band -> 5-10 lb DBs", "image": "Lateral Raise - With Bands"}, {"name": "Crunch", "counts": 8, "mode": "dynamic", "kit": "Bodyweight", "setup": "Supine, knees bent, hands at the temples", "cue": "Curl up for 3s, lower for 3s; keep the shoulders off the floor on the 4s off", "load": "Bodyweight -> arms overhead", "image": "Crunches"}, {"name": "Plank", "counts": 8, "mode": "iso", "kit": "Bodyweight", "setup": "High plank, hands under shoulders, body in one line", "cue": "Brace hard and hold the line for the full 6s; drop to the knees on the 4s off", "load": "Feet wider = easier; add a slow shoulder tap per impulse", "image": "Push Up to Side Plank"}, {"name": "Side Plank", "counts": 8, "mode": "iso", "kit": "Bodyweight", "setup": "On one forearm, feet stacked, hips lifted", "cue": "Lift and hold 6s; drop the hip on the 4s off; switch sides every 4 impulses", "load": "Knees down -> feet stacked -> top arm overhead", "image": "Side Bridge"}, {"name": "Standing Calf Raise", "counts": 8, "mode": "squeeze", "kit": "Bodyweight or DBs", "setup": "Balls of the feet on a stair edge, heels hanging", "cue": "Rise fast and squeeze the top for 6s; lower slowly across the 4s off", "load": "Bodyweight -> single leg -> DBs", "image": "Standing Dumbbell Calf Raise"}]}, {"name": "Day 2 - Pull Emphasis", "baseCounts": 2, "exercises": [{"name": "Sumo / Plie Squat", "counts": 10, "mode": "dynamic", "kit": "KB or DB held between the legs", "setup": "Wide stance, toes turned out ~30 deg", "cue": "Sink for 3s, drive up for 3s; reset on the 4s off", "load": "Bodyweight -> 25-45 lb KB", "image": "Plie Dumbbell Squat"}, {"name": "Bent-Over Row", "counts": 10, "mode": "dynamic", "kit": "Dumbbells or KBs", "setup": "Hinged 45 deg, flat back, arms hanging", "cue": "Row to the ribs for 3s, lower for 3s; let the arms hang on the 4s off", "load": "15-35 lb DBs", "image": "Bent Over Two-Dumbbell Row"}, {"name": "Straight-Arm Dumbbell Pullover", "counts": 10, "mode": "dynamic", "kit": "One DB or KB", "setup": "Supine on the mat, knees bent, one bell over the chest", "cue": "Lower behind the head for 3s, pull back over for 3s; reset on the 4s off", "load": "20-35 lb; stop where the ribs want to flare", "image": "Straight-Arm Dumbbell Pullover"}, {"name": "Romanian Deadlift", "counts": 10, "mode": "dynamic", "kit": "Dumbbells or KBs", "setup": "Feet hip-width, soft knees, bells at the thighs", "cue": "Hinge down for 3s, stand for 3s; reset the hips on the 4s off", "load": "Bodyweight -> 20-40 lb DBs", "image": "Stiff-Legged Dumbbell Deadlift"}, {"name": "Bent-Over Reverse Fly", "counts": 10, "mode": "squeeze", "kit": "Light dumbbells", "setup": "Hinged forward, flat back, bells hanging under the chest", "cue": "Open wide and pinch the shoulder blades for 6s; lower slowly across the 4s off", "load": "5-15 lb only; never shrug", "image": "Reverse Flyes"}, {"name": "Biceps Curl", "counts": 10, "mode": "dynamic", "kit": "Dumbbells or band", "setup": "Standing tall, elbows pinned to the sides", "cue": "Curl for 3s, lower for 3s; arms straight on the 4s off", "load": "15-30 lb DBs", "image": "Dumbbell Bicep Curl"}, {"name": "Reverse Lunge", "counts": 10, "mode": "dynamic", "kit": "Bodyweight or DBs", "setup": "Standing tall, alternating legs", "cue": "Step back and lower for 3s, drive up for 3s; switch legs on the 4s off", "load": "Bodyweight -> 15-25 lb DBs", "image": "Dumbbell Rear Lunge"}, {"name": "Superman", "counts": 10, "mode": "iso", "kit": "Bodyweight", "setup": "Prone on the mat, arms extended overhead", "cue": "Lift the chest, arms and legs and hold the 6s; relax flat on the 4s off", "load": "Bodyweight only", "image": "Superman"}, {"name": "Quadruped Glute Kickback", "counts": 10, "mode": "squeeze", "kit": "Bodyweight or ankle band", "setup": "On hands and knees, back flat", "cue": "Drive the heel up and squeeze 6s; lower slowly across the 4s off; switch legs every 5 impulses", "load": "Bodyweight -> mini band at the ankles", "image": "Glute Kickback"}, {"name": "Reverse Crunch", "counts": 10, "mode": "dynamic", "kit": "Bodyweight", "setup": "Supine, hands by the hips, knees at 90 deg", "cue": "Curl the pelvis up for 3s, lower for 3s; feet stay off the floor on the 4s off", "load": "Bodyweight -> legs straighter", "image": "Reverse Crunch"}]}, {"name": "Day 3 - Legs and Core", "baseCounts": 2, "exercises": [{"name": "Goblet Squat", "counts": 8, "mode": "dynamic", "kit": "KB or DB at chest", "setup": "Bell at the chest, elbows inside the knees", "cue": "Sink for 3s to full depth, drive up for 3s; reset on the 4s off", "load": "25-45 lb; go deeper before you go heavier", "image": "Goblet Squat"}, {"name": "Split Squat - Right", "counts": 8, "mode": "dynamic", "kit": "Bodyweight or DBs", "setup": "Staggered stance, right foot forward, rear heel up", "cue": "Lower straight down for 3s, drive up for 3s; reset on the 4s off", "load": "Bodyweight -> DBs at the sides", "image": "Split Squats"}, {"name": "Split Squat - Left", "counts": 8, "mode": "dynamic", "kit": "Bodyweight or DBs", "setup": "Staggered stance, left foot forward, rear heel up", "cue": "Lower straight down for 3s, drive up for 3s; reset on the 4s off", "load": "Bodyweight -> DBs at the sides", "image": "Split Squats"}, {"name": "Lateral Lunge", "counts": 8, "mode": "dynamic", "kit": "Bodyweight or KB at chest", "setup": "Very wide stance, hands or bell at the chest", "cue": "Shift into one hip for 3s, push back to centre for 3s; alternate sides each impulse", "load": "Bodyweight -> 20-30 lb KB", "image": "Barbell Side Split Squat"}, {"name": "Step-Up with Knee Drive", "counts": 8, "mode": "dynamic", "kit": "Bottom stair or sturdy chair, +/- DBs", "setup": "Facing a 12-18 in step", "cue": "Step up and drive the knee over 3s, lower under control for 3s; switch legs on the 4s off", "load": "Bodyweight -> DBs at the sides", "image": "Step-up with Knee Raise"}, {"name": "Single-Leg Glute Bridge - Right", "counts": 8, "mode": "squeeze", "kit": "Bodyweight", "setup": "Supine, right foot planted, left leg extended", "cue": "Drive the hips up and squeeze 6s; lower slowly across the 4s off", "load": "Bodyweight -> extended leg higher", "image": "Single Leg Glute Bridge"}, {"name": "Single-Leg Glute Bridge - Left", "counts": 8, "mode": "squeeze", "kit": "Bodyweight", "setup": "Supine, left foot planted, right leg extended", "cue": "Drive the hips up and squeeze 6s; lower slowly across the 4s off", "load": "Bodyweight -> extended leg higher", "image": "Single Leg Glute Bridge"}, {"name": "Side Leg Raise (Hip Abduction)", "counts": 8, "mode": "squeeze", "kit": "Bodyweight or mini band", "setup": "Side-lying on the mat, torso braced", "cue": "Raise the leg and squeeze 6s; lower slowly across the 4s off; switch sides every 4 impulses", "load": "Bodyweight -> mini band above the knees", "image": "Side Leg Raises"}, {"name": "Standing Calf Raise", "counts": 8, "mode": "squeeze", "kit": "Bodyweight or DBs", "setup": "Balls of the feet on a stair edge", "cue": "Rise fast and squeeze the top for 6s; lower slowly across the 4s off", "load": "Bodyweight -> single leg", "image": "Standing Dumbbell Calf Raise"}, {"name": "Dead Bug", "counts": 8, "mode": "dynamic", "kit": "Bodyweight", "setup": "Supine, arms up, knees at 90 deg, low back flat", "cue": "Extend the opposite arm and leg over 3s, return over 3s; alternate each impulse", "load": "Bodyweight -> straighten the legs further", "image": "Dead Bug"}, {"name": "Plank with Shoulder Tap", "counts": 8, "mode": "iso", "kit": "Bodyweight", "setup": "High plank, feet wide", "cue": "Brace and hold; one slow shoulder tap per impulse without the hips rotating", "load": "Feet wider = easier; narrower = harder", "image": "Push Up to Side Plank"}, {"name": "Russian Twist", "counts": 8, "mode": "dynamic", "kit": "Bodyweight or light DB/KB", "setup": "Seated, knees bent, torso leaned back ~45 deg", "cue": "Rotate across for 3s, return to centre for 3s; alternate sides each impulse", "load": "Bodyweight -> 10-20 lb bell", "image": "Russian Twist"}]}]};

/* Exercise name -> [start position, working position] photo paths (one entry = single photo). */
const IMAGES = {
 "Goblet Squat": [
  "img/goblet-squat-1.jpg",
  "img/goblet-squat-2.jpg"
 ],
 "Pushups": [
  "img/pushups-1.jpg",
  "img/pushups-2.jpg"
 ],
 "Dumbbell Floor Press": [
  "img/dumbbell-floor-press-1.jpg",
  "img/dumbbell-floor-press-2.jpg"
 ],
 "Bodyweight Walking Lunge": [
  "img/bodyweight-walking-lunge-1.jpg",
  "img/bodyweight-walking-lunge-2.jpg"
 ],
 "Shoulder Press - With Bands": [
  "img/shoulder-press-with-bands-1.jpg",
  "img/shoulder-press-with-bands-2.jpg"
 ],
 "Butt Lift (Bridge)": [
  "img/butt-lift-bridge-1.jpg",
  "img/butt-lift-bridge-2.jpg"
 ],
 "Tricep Dumbbell Kickback": [
  "img/tricep-dumbbell-kickback-1.jpg",
  "img/tricep-dumbbell-kickback-2.jpg"
 ],
 "Lateral Raise - With Bands": [
  "img/lateral-raise-with-bands-1.jpg",
  "img/lateral-raise-with-bands-2.jpg"
 ],
 "Crunches": [
  "img/crunches-1.jpg",
  "img/crunches-2.jpg"
 ],
 "Push Up to Side Plank": [
  "img/push-up-to-side-plank-1.jpg"
 ],
 "Side Bridge": [
  "img/side-bridge-1.jpg"
 ],
 "Standing Dumbbell Calf Raise": [
  "img/standing-dumbbell-calf-raise-1.jpg",
  "img/standing-dumbbell-calf-raise-2.jpg"
 ],
 "Plie Dumbbell Squat": [
  "img/plie-dumbbell-squat-1.jpg",
  "img/plie-dumbbell-squat-2.jpg"
 ],
 "Bent Over Two-Dumbbell Row": [
  "img/bent-over-two-dumbbell-row-1.jpg",
  "img/bent-over-two-dumbbell-row-2.jpg"
 ],
 "Straight-Arm Dumbbell Pullover": [
  "img/straight-arm-dumbbell-pullover-1.jpg",
  "img/straight-arm-dumbbell-pullover-2.jpg"
 ],
 "Stiff-Legged Dumbbell Deadlift": [
  "img/stiff-legged-dumbbell-deadlift-1.jpg",
  "img/stiff-legged-dumbbell-deadlift-2.jpg"
 ],
 "Reverse Flyes": [
  "img/reverse-flyes-1.jpg",
  "img/reverse-flyes-2.jpg"
 ],
 "Dumbbell Bicep Curl": [
  "img/dumbbell-bicep-curl-1.jpg",
  "img/dumbbell-bicep-curl-2.jpg"
 ],
 "Dumbbell Rear Lunge": [
  "img/dumbbell-rear-lunge-1.jpg",
  "img/dumbbell-rear-lunge-2.jpg"
 ],
 "Superman": [
  "img/superman-1.jpg"
 ],
 "Glute Kickback": [
  "img/glute-kickback-1.jpg",
  "img/glute-kickback-2.jpg"
 ],
 "Reverse Crunch": [
  "img/reverse-crunch-1.jpg",
  "img/reverse-crunch-2.jpg"
 ],
 "Split Squats": [
  "img/split-squats-1.jpg",
  "img/split-squats-2.jpg"
 ],
 "Barbell Side Split Squat": [
  "img/barbell-side-split-squat-1.jpg",
  "img/barbell-side-split-squat-2.jpg"
 ],
 "Step-up with Knee Raise": [
  "img/step-up-with-knee-raise-1.jpg",
  "img/step-up-with-knee-raise-2.jpg"
 ],
 "Single Leg Glute Bridge": [
  "img/single-leg-glute-bridge-1.jpg",
  "img/single-leg-glute-bridge-2.jpg"
 ],
 "Side Leg Raises": [
  "img/side-leg-raises-1.jpg",
  "img/side-leg-raises-2.jpg"
 ],
 "Dead Bug": [
  "img/dead-bug-1.jpg",
  "img/dead-bug-2.jpg"
 ],
 "Russian Twist": [
  "img/russian-twist-1.jpg",
  "img/russian-twist-2.jpg"
 ]
};

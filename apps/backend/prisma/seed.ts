import { PrismaClient, MuscleGroup, EquipmentType, Goal, ActivityLevel, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.nutritionLog.deleteMany();
  await prisma.mealPlanItem.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.userNutritionPlan.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.foodSwap.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.userWorkoutPlan.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.swapGroup.deleteMany();
  await prisma.template.deleteMany();
  await prisma.groceryItem.deleteMany();
  await prisma.groceryList.deleteMany();
  await prisma.user.deleteMany();

  // Create Coach
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const coach = await prisma.user.create({
    data: {
      email: 'coach@scalefit.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Coach',
      role: 'COACH',
      subscriptionStatus: 'ELITE',
    },
  });

  console.log('✅ Created coach:', coach.email);

  // Create Athletes
  const athletes = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah@example.com',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'ATHLETE',
        coachId: coach.id,
        gender: 'FEMALE',
        dateOfBirth: new Date('1995-03-15'),
        heightCm: 165,
        currentWeightKg: 68.5,
        targetWeightKg: 60,
        goal: 'WEIGHT_LOSS',
        activityLevel: 'MODERATELY_ACTIVE',
        subscriptionStatus: 'PRO',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike@example.com',
        passwordHash,
        firstName: 'Mike',
        lastName: 'Chen',
        role: 'ATHLETE',
        coachId: coach.id,
        gender: 'MALE',
        dateOfBirth: new Date('1992-07-22'),
        heightCm: 178,
        currentWeightKg: 82.3,
        targetWeightKg: 88,
        goal: 'WEIGHT_GAIN',
        activityLevel: 'VERY_ACTIVE',
        subscriptionStatus: 'ELITE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma@example.com',
        passwordHash,
        firstName: 'Emma',
        lastName: 'Davis',
        role: 'ATHLETE',
        coachId: coach.id,
        gender: 'FEMALE',
        dateOfBirth: new Date('1998-11-08'),
        heightCm: 170,
        currentWeightKg: 58.2,
        targetWeightKg: 58,
        goal: 'MAINTENANCE',
        activityLevel: 'LIGHTLY_ACTIVE',
        subscriptionStatus: 'PRO',
      },
    }),
  ]);

  console.log('✅ Created', athletes.length, 'athletes');

  // Create Swap Groups
  const swapGroups = await Promise.all([
    prisma.swapGroup.create({
      data: { name: 'Quad Dominant Compound', description: 'Exercises targeting quadriceps with compound movements' },
    }),
    prisma.swapGroup.create({
      data: { name: 'Horizontal Push', description: 'Chest pressing movements' },
    }),
    prisma.swapGroup.create({
      data: { name: 'Vertical Pull', description: 'Back pulling movements' },
    }),
    prisma.swapGroup.create({
      data: { name: 'Hip Hinge', description: 'Posterior chain movements' },
    }),
  ]);

  // Create Exercises
  const exercises = await Promise.all([
    // Quad Dominant
    prisma.exercise.create({
      data: {
        name: 'Barbell Back Squat',
        description: 'The king of leg exercises. Builds overall leg strength and mass.',
        instructions: '1. Set up under the bar\n2. Unrack and step back\n3. Brace core and squat down\n4. Drive through heels to stand',
        targetMuscle: 'QUADRICEPS',
        secondaryMuscles: ['GLUTES', 'HAMSTRINGS', 'CORE'],
        equipmentType: 'BARBELL',
        swapGroupId: swapGroups[0].id,
        isGlobal: true,
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Leg Press',
        description: 'Machine-based quad exercise with less lower back stress.',
        targetMuscle: 'QUADRICEPS',
        secondaryMuscles: ['GLUTES'],
        equipmentType: 'MACHINE',
        swapGroupId: swapGroups[0].id,
        isGlobal: true,
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Hack Squat',
        description: 'Machine squat variation for quad focus.',
        targetMuscle: 'QUADRICEPS',
        equipmentType: 'MACHINE',
        swapGroupId: swapGroups[0].id,
        isGlobal: true,
      },
    }),
    // Horizontal Push
    prisma.exercise.create({
      data: {
        name: 'Barbell Bench Press',
        description: 'Classic chest builder.',
        targetMuscle: 'CHEST',
        secondaryMuscles: ['SHOULDERS', 'TRICEPS'],
        equipmentType: 'BARBELL',
        swapGroupId: swapGroups[1].id,
        isGlobal: true,
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Dumbbell Bench Press',
        description: 'Dumbbell variation for better range of motion.',
        targetMuscle: 'CHEST',
        secondaryMuscles: ['SHOULDERS', 'TRICEPS'],
        equipmentType: 'DUMBBELL',
        swapGroupId: swapGroups[1].id,
        isGlobal: true,
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Machine Chest Press',
        description: 'Guided chest press for beginners or isolation.',
        targetMuscle: 'CHEST',
        equipmentType: 'MACHINE',
        swapGroupId: swapGroups[1].id,
        isGlobal: true,
      },
    }),
    // Vertical Pull
    prisma.exercise.create({
      data: {
        name: 'Pull-up',
        description: 'Bodyweight back exercise.',
        targetMuscle: 'BACK',
        secondaryMuscles: ['BICEPS'],
        equipmentType: 'BODYWEIGHT',
        swapGroupId: swapGroups[2].id,
        isGlobal: true,
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Lat Pulldown',
        description: 'Cable machine for lat development.',
        targetMuscle: 'BACK',
        secondaryMuscles: ['BICEPS'],
        equipmentType: 'CABLE',
        swapGroupId: swapGroups[2].id,
        isGlobal: true,
      },
    }),
    // Hip Hinge
    prisma.exercise.create({
      data: {
        name: 'Romanian Deadlift',
        description: 'Hamstring and glute focused hip hinge.',
        targetMuscle: 'HAMSTRINGS',
        secondaryMuscles: ['GLUTES', 'BACK'],
        equipmentType: 'BARBELL',
        swapGroupId: swapGroups[3].id,
        isGlobal: true,
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Conventional Deadlift',
        description: 'Full body strength builder.',
        targetMuscle: 'BACK',
        secondaryMuscles: ['HAMSTRINGS', 'GLUTES', 'CORE'],
        equipmentType: 'BARBELL',
        swapGroupId: swapGroups[3].id,
        isGlobal: true,
      },
    }),
  ]);

  console.log('✅ Created', exercises.length, 'exercises');

  // Create Food Items
  const foods = await Promise.all([
    prisma.foodItem.create({
      data: {
        name: 'Chicken Breast',
        caloriesPer100g: 165,
        proteinPer100g: 31,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        category: 'Proteins',
        isVerified: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'White Rice',
        caloriesPer100g: 130,
        proteinPer100g: 2.7,
        carbsPer100g: 28,
        fatPer100g: 0.3,
        category: 'Carbs',
        isVerified: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Sweet Potato',
        caloriesPer100g: 86,
        proteinPer100g: 1.6,
        carbsPer100g: 20,
        fatPer100g: 0.1,
        category: 'Carbs',
        isVerified: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Broccoli',
        caloriesPer100g: 34,
        proteinPer100g: 2.8,
        carbsPer100g: 7,
        fatPer100g: 0.4,
        fiberPer100g: 2.6,
        category: 'Vegetables',
        isVerified: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Salmon',
        caloriesPer100g: 208,
        proteinPer100g: 20,
        carbsPer100g: 0,
        fatPer100g: 13,
        category: 'Proteins',
        isVerified: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Eggs',
        caloriesPer100g: 155,
        proteinPer100g: 13,
        carbsPer100g: 1.1,
        fatPer100g: 11,
        category: 'Proteins',
        isVerified: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Oatmeal',
        caloriesPer100g: 389,
        proteinPer100g: 17,
        carbsPer100g: 66,
        fatPer100g: 7,
        fiberPer100g: 10,
        category: 'Carbs',
        isVerified: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Greek Yogurt',
        caloriesPer100g: 97,
        proteinPer100g: 9,
        carbsPer100g: 3.6,
        fatPer100g: 5,
        category: 'Dairy',
        isVerified: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Avocado',
        caloriesPer100g: 160,
        proteinPer100g: 2,
        carbsPer100g: 9,
        fatPer100g: 15,
        category: 'Fats',
        isVerified: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Olive Oil',
        caloriesPer100g: 884,
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 100,
        category: 'Fats',
        isVerified: true,
      },
    }),
  ]);

  console.log('✅ Created', foods.length, 'food items');

  // Create a Workout Plan
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      name: 'Push Pull Legs - Beginner',
      description: 'A classic 3-day split for beginners focusing on compound movements.',
      difficulty: 2,
      durationWeeks: 8,
      coachId: coach.id,
      isTemplate: true,
    },
  });

  // Add workouts to the plan
  const workouts = await Promise.all([
    prisma.workout.create({
      data: {
        name: 'Day 1 - Push',
        dayOfWeek: 1,
        weekNumber: 1,
        orderIndex: 0,
        workoutPlanId: workoutPlan.id,
        exercises: {
          create: [
            { exerciseId: exercises[3].id, orderIndex: 0, sets: 4, repsMin: 6, repsMax: 8, restSeconds: 180 },
            { exerciseId: exercises[4].id, orderIndex: 1, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 120 },
          ],
        },
      },
    }),
    prisma.workout.create({
      data: {
        name: 'Day 2 - Pull',
        dayOfWeek: 3,
        weekNumber: 1,
        orderIndex: 1,
        workoutPlanId: workoutPlan.id,
        exercises: {
          create: [
            { exerciseId: exercises[9].id, orderIndex: 0, sets: 4, repsMin: 5, repsMax: 5, restSeconds: 180 },
            { exerciseId: exercises[7].id, orderIndex: 1, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 120 },
          ],
        },
      },
    }),
    prisma.workout.create({
      data: {
        name: 'Day 3 - Legs',
        dayOfWeek: 5,
        weekNumber: 1,
        orderIndex: 2,
        workoutPlanId: workoutPlan.id,
        exercises: {
          create: [
            { exerciseId: exercises[0].id, orderIndex: 0, sets: 4, repsMin: 6, repsMax: 8, restSeconds: 180 },
            { exerciseId: exercises[8].id, orderIndex: 1, sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120 },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Created workout plan with', workouts.length, 'workouts');

  // Create a Nutrition Plan
  const nutritionPlan = await prisma.nutritionPlan.create({
    data: {
      name: 'Fat Loss - Moderate Deficit',
      description: 'Balanced macro split with 20% calorie deficit for sustainable fat loss.',
      dailyCalories: 1800,
      proteinGrams: 150,
      carbGrams: 160,
      fatGrams: 60,
      proteinRatio: 0.33,
      carbRatio: 0.36,
      fatRatio: 0.30,
      mealsPerDay: 4,
      coachId: coach.id,
      isTemplate: true,
    },
  });

  console.log('✅ Created nutrition plan');

  // Assign plans to athletes
  await prisma.userWorkoutPlan.create({
    data: {
      userId: athletes[0].id,
      workoutPlanId: workoutPlan.id,
      isActive: true,
    },
  });

  await prisma.userNutritionPlan.create({
    data: {
      userId: athletes[0].id,
      nutritionPlanId: nutritionPlan.id,
      isActive: true,
    },
  });

  console.log('✅ Assigned plans to athlete');

  // Create sample check-ins
  const checkIn = await prisma.checkIn.create({
    data: {
      userId: athletes[0].id,
      weightKg: 68.5,
      sleepQuality: 7,
      stressLevel: 4,
      hungerLevel: 5,
      energyLevel: 8,
      athleteNotes: 'Great week! Feeling stronger and more energized.',
      status: 'SUBMITTED',
      periodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
    },
  });

  console.log('✅ Created sample check-in');

  // Create sample alerts
  await prisma.alert.createMany({
    data: [
      {
        userId: athletes[1].id,
        type: 'INACTIVITY',
        severity: 'WARNING',
        title: 'Inactive for 4 days',
        message: 'Mike Chen hasn\'t logged a workout in 4 days.',
      },
      {
        userId: athletes[2].id,
        type: 'MISSED_CHECKIN',
        severity: 'INFO',
        title: 'Check-in reminder',
        message: 'Emma Davis\'s check-in is due in 2 days.',
      },
    ],
  });

  console.log('✅ Created sample alerts');

  // Create templates
  await prisma.template.createMany({
    data: [
      {
        name: 'PPL - Advanced',
        description: 'Push Pull Legs split for advanced lifters',
        type: 'WORKOUT',
        coachId: coach.id,
        content: { weeks: 12, daysPerWeek: 6 },
        tags: ['strength', 'hypertrophy', 'advanced'],
        isPublic: false,
      },
      {
        name: 'High Protein Cutting',
        description: 'Aggressive deficit with high protein retention',
        type: 'NUTRITION',
        coachId: coach.id,
        content: { calories: 1600, protein: 180, carbs: 100, fat: 50 },
        tags: ['cutting', 'high-protein', 'fat-loss'],
        isPublic: false,
      },
      {
        name: 'Basic Supplement Stack',
        description: 'Essential supplements for gym-goers',
        type: 'SUPPLEMENT',
        coachId: coach.id,
        content: {
          supplements: [
            { name: 'Creatine Monohydrate', dosage: '5g', timing: 'Daily' },
            { name: 'Vitamin D3', dosage: '5000 IU', timing: 'Morning' },
            { name: 'Fish Oil', dosage: '2g EPA/DHA', timing: 'With meals' },
          ],
        },
        tags: ['beginner', 'essentials'],
        isPublic: true,
      },
    ],
  });

  console.log('✅ Created templates');

  console.log('\n🎉 Seeding complete!\n');
  console.log('Test accounts:');
  console.log('  Coach: coach@scalefit.com / password123');
  console.log('  Athlete: sarah@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


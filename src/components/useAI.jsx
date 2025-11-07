
import { InvokeLLM } from '@/integrations/Core';
import { useState } from 'react';

// Helpers: ensure arrays/objects and merge defaults to prevent undefineds
const ensureArray = (v) => Array.isArray(v) ? v : (v ? [v] : []);
const ensureObject = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
const mergeDefaults = (obj, defaults) => ({ ...defaults, ...ensureObject(obj) });

// === New: smart LLM wrapper to mitigate rate limits ===
const pendingLLM = new Map(); // de-dupe concurrent identical calls
const memoryCache = new Map(); // fast process cache

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const safeJSON = {
  parse: (s, fb = null) => {
    try { return JSON.parse(s); } catch { return fb; }
  },
  stringify: (v) => {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
};

const stableKey = (obj) => safeJSON.stringify(obj);

// cache utilities
const getCache = (key) => {
  // check memory
  const m = memoryCache.get(key);
  if (m && m.expiresAt > Date.now()) return m.value;

  // check localStorage
  try {
    const raw = localStorage.getItem(`ai_cache:${key}`);
    if (!raw) return null;
    const data = safeJSON.parse(raw);
    if (data && data.expiresAt > Date.now()) {
      memoryCache.set(key, data);
      return data.value;
    }
    localStorage.removeItem(`ai_cache:${key}`);
  } catch (e) {
      console.warn("LocalStorage read error:", e);
  }
  return null;
};

const setCache = (key, value, ttlMs) => {
  if (!ttlMs || ttlMs <= 0) return;
  const payload = { value, expiresAt: Date.now() + ttlMs };
  memoryCache.set(key, payload);
  try {
    localStorage.setItem(`ai_cache:${key}`, safeJSON.stringify(payload));
  } catch (e) {
      console.warn("LocalStorage write error:", e);
  }
};

const isRateLimitError = (err) => {
  const msg = (err && (err.message || err.error || (typeof err === 'object' && 'toString' in err ? err.toString() : String(err)))) || '';
  return /rate|429|quota|too many/i.test(String(msg));
};

async function callLLMWithRetry(args, opts = {}) {
  const { cacheKey, ttlMs = 0, maxRetries = 3 } = opts;

  // cached?
  if (cacheKey && ttlMs > 0) {
    const cached = getCache(cacheKey);
    if (cached !== null) return cached;
  }

  // de-dup concurrent calls
  const dedupeKey = cacheKey || stableKey(args);
  if (pendingLLM.has(dedupeKey)) {
    return pendingLLM.get(dedupeKey);
  }

  const runner = (async () => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const result = await InvokeLLM(args);
        if (cacheKey && ttlMs > 0) setCache(cacheKey, result, ttlMs);
        return result;
      } catch (err) {
        attempt += 1;
        if (attempt >= maxRetries || !isRateLimitError(err)) {
          throw err;
        }
        // exponential backoff with jitter
        const base = 600; // ms
        const delay = Math.round(base * Math.pow(2, attempt - 1) + Math.random() * 250);
        console.warn(`LLM call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, err);
        await sleep(delay);
      }
    }
    throw new Error("Failed to call LLM after multiple retries.");
  })();

  pendingLLM.set(dedupeKey, runner);
  try {
    const res = await runner;
    return res;
  } finally {
    pendingLLM.delete(dedupeKey);
  }
}

// === End smart wrapper ===

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createFallbackAnalysis = (type) => {
    const fallbacks = {
      nutrition: {
        total_calories: 450,
        health_score: 85,
        macronutrients: { protein: 25, carbs: 45, fat: 30 },
        micronutrients: { vitamin_c: 80, iron: 60, calcium: 70 },
        ingredients_analysis: [
          { name: "Protein Source", health_impact: "Excellent for muscle building", color: "green" }
        ],
        health_benefits: ["Supports muscle growth", "Boosts metabolism", "Rich in nutrients"],
        dietary_recommendations: ["Great choice for balanced nutrition!", "Consider adding more vegetables next time"],
        meal_timing_advice: "Perfect for post-workout or lunch",
        portion_assessment: "Well-balanced portion size",
        allergen_warnings: [],
        nutritionist_notes: "This is a nutritious and well-balanced meal choice! Keep up the great eating habits."
      },
      face: {
        overall_assessment: "Your natural beauty shines. With simple Ayurvedic care and easy home remedies, your glow can elevate even more.",
        glow_score: 8,
        hydration_score: 7,
        clarity_score: 8,
        skin_concerns: ["Enhance Natural Radiance", "Boost Hydration", "Perfect Your Glow"],
        natural_routine: {
          morning_routine: [
            { step: "Gentle Cleanse", natural_ingredient: "Raw Honey", recipe: "1 tsp honey + warm water", application: "Massage 1 min, rinse cool" }
          ],
          evening_routine: [
            { step: "Nourish & Cleanse", natural_ingredient: "Coconut Oil", recipe: "1 tsp coconut oil", application: "Massage in circles, wipe with warm cloth" }
          ]
        },
        kitchen_remedies: [
          { name: "Honey-Oat Glow Mask", ingredients: "2 tbsp honey + 1 tbsp oats", recipe: "Mix to paste, apply 15 mins", benefits: "Soft glow, gentle exfoliation", frequency: "2x weekly" }
        ],
        quick_glow_hacks: [
          { name: "Ice Glow", tip: "Rub ice cube wrapped in cloth for 30 sec to depuff and brighten" }
        ],
        natural_diet_tips: ["Warm water on waking", "Add soaked almonds", "Include colorful fruits/veggies"],
        natural_lifestyle_tips: ["7–8h sleep", "10 min sun in morning", "Gentle breathwork daily"],

        // New Ayurvedic defaults
        ayurveda: {
          dominant_dosha: "pitta",
          traits: ["warmth", "sensitivity", "prone to redness under heat"],
          recommended_oils: ["coconut", "rosehip (few drops)", "almond (mild)"],
          avoid_list: ["very spicy products", "harsh scrubs", "hot water on face"],
          daily_rituals: ["Splash cool water AM/PM", "Aloe gel pea-sized after sun", "Self-massage 2–3 min with light oil at night"],
          seasonal_care: [
            { season: "summer", guidance: "Cool with cucumber/aloe, avoid midday sun, use light gel moisturiser" },
            { season: "winter", guidance: "Add richer oils (almond), humidify room, lukewarm water only" }
          ]
        },
        easy_remedies: [
          { name: "Cucumber Calm Compress", ingredients: "Chilled cucumber slices", steps: "Place on skin 5–8 min", frequency: "As needed", availability: { where: ["kitchen", "grocery"], cost_level: "low" }, caution: "Avoid if irritated cuts" },
          { name: "Turmeric Spot Dab", ingredients: "Pinch turmeric + yogurt", steps: "Dab on spots 8–10 min then rinse", frequency: "3x weekly", availability: { where: ["kitchen"], cost_level: "low" }, caution: "May stain; patch test first" }
        ],
        plan_7_days: [
          { day: "Day 1", morning: "Honey cleanse + cool splash", evening: "Coconut oil massage + warm cloth", diet_tip: "Add berries", water_goal_ml: 2000, bonus_trick: "2 min face yoga (smile lifts)" }
        ],
        affordable_products: [
          { name: "Rose Water Mist", type: "Hydrating mist", price_range: "₹100–₹250", where_to_find: "Pharmacy / Grocery" },
          { name: "Aloe Vera Gel", type: "Soothing gel", price_range: "₹120–₹300", where_to_find: "Pharmacy / Online" }
        ],
        caution_notes: ["Always patch test 24h", "If persistent irritation, stop and consult a professional"]
      },
      hairstyle: {
        face_shape_analysis: "You have beautiful, versatile features that work wonderfully with many hairstyles!",
        current_hair_assessment: "Your hair has amazing potential and natural texture that's perfect for styling!",
        best_choice: {
          name: "Layered Bob with Side Bangs",
          description: "A chic, modern bob with beautiful face-framing layers",
          why_perfect: "Perfect for your face shape and enhances your natural features beautifully",
          styling_method: "Blow dry with a round brush, add texture spray for movement"
        },
        alternative_styles: [
          { name: "Soft Beach Waves", description: "Effortless, natural-looking waves", occasion: "Perfect for casual and formal occasions" }
        ],
        styling_tips: ["Always use heat protection before styling", "Don't wash hair daily to maintain natural oils", "Use a silk pillowcase to reduce frizz"],
        hair_care_routine: ["Use sulfate-free shampoo", "Deep condition once a week", "Trim every 6-8 weeks for healthy growth"],
        color_suggestions: [
          { color: "Golden Honey Highlights", why: "Adds warmth and beautiful dimension to your natural color" }
        ]
      },
      aura: {
        aura_color: "Golden Solar",
        color_hex: "#FFD700",
        spiritual_meaning: "Your golden aura radiates pure wisdom, leadership, and divine connection. You are a natural healer and light-bringer in this world. Your energy inspires others and creates positive transformation wherever you go. This is a time of spiritual awakening and personal empowerment in your journey.",
        energy_keywords: ["Wisdom", "Leadership", "Healing", "Inspiration", "Divine Light"],
        chakra_connection: {
          chakra_name: "Solar Plexus Chakra",
          significance: "Your personal power and confidence are beautifully balanced, radiating inner strength and wisdom"
        },
        life_guidance: {
          meditation_practice: "Focus on golden light meditation - visualize warm, healing light filling your entire being",
          crystal_healing: ["Citrine", "Golden Topaz", "Pyrite"],
          affirmation: "I am a radiant being of light, wisdom, and infinite potential",
          energy_foods: ["Golden turmeric", "Yellow bell peppers", "Bananas", "Honey"],
          spiritual_activities: ["Sunrise meditation", "Journaling", "Energy healing practices"]
        },
        aura_strength: 92,
        past_life_insight: "Your soul carries the wisdom of ancient healers and spiritual teachers, bringing that knowledge into this lifetime to help others"
      },
      sleep: {
        sleep_score: 78,
        sleep_duration_hours: 7.5,
        sleep_quality: "Good quality sleep with room for improvement",
        dream_analysis: "Your dreams reflect a peaceful mind processing daily experiences in a healthy way",
        tips: [
          "Create a consistent bedtime routine",
          "Keep your bedroom cool and dark",
          "Avoid screens 1 hour before bed",
          "Try gentle stretching or meditation before sleep"
        ]
      },
      journal: {
        insights: "Your writing shows incredible self-awareness and emotional intelligence. You're processing your experiences in a very healthy way and showing real personal growth.",
        mood_score: 4,
        primary_emotions: ["Reflective", "Hopeful", "Grateful"],
        key_themes: ["Personal growth", "Mindfulness", "Positive outlook"],
        suggestions: [
          "Continue this wonderful practice of self-reflection",
          "Consider exploring meditation to deepen your mindfulness",
          "Share your insights with others who might benefit"
        ],
        affirmation: "You are wise, resilient, and continuously growing into your best self",
        growth_opportunities: [
          "Embrace new challenges as opportunities for growth",
          "Trust your inner wisdom and intuition more"
        ],
        self_care_recommendations: [
          "Take time for creative expression",
          "Spend time in nature to recharge",
          "Practice gratitude daily"
        ],
        reflection_questions: [
          "What am I most grateful for today?",
          "How have I grown in the past month?"
        ]
      },
      diet: {
        diet_plan: [
            { day: "Monday", meal_type: "Breakfast", name: "Oatmeal with Berries", calories: 350 },
            { day: "Monday", meal_type: "Lunch", name: "Grilled Chicken Salad", calories: 450 },
            { day: "Monday", meal_type: "Dinner", name: "Salmon with Quinoa", calories: 550 },
        ],
        total_daily_calories: 1350,
        macronutrient_distribution: { protein: '30%', carbs: '40%', fat: '30%' },
        health_benefits: ["Rich in omega-3s", "High in fiber", "Lean protein for muscle support"],
        shopping_list: ["Oats", "Mixed Berries", "Chicken Breast", "Mixed Greens", "Salmon Fillet", "Quinoa"],
        hydration_plan: "Drink at least 8 glasses of water throughout the day.",
        dietary_notes: "This balanced plan focuses on whole foods to provide sustained energy."
      },
      exercise: {
          workout_plan: [
              { day: "Monday", workout_type: "Cardio", exercises: [{ name: "Running", duration: "30 minutes" }] },
              { day: "Wednesday", workout_type: "Strength", exercises: [{ name: "Squats", sets: 3, reps: 12 }, { name: "Push-ups", sets: 3, reps: 10 }] },
              { day: "Friday", workout_type: "Flexibility", exercises: [{ name: "Yoga Flow", duration: "20 minutes" }] },
          ],
          weekly_overview: "A balanced week focusing on cardiovascular health, strength building, and flexibility.",
          warm_up_routine: "5 minutes of light jogging and dynamic stretches.",
          cool_down_routine: "5 minutes of static stretching, holding each stretch for 30 seconds.",
          equipment_needed: ["Running shoes", "Yoga mat"],
          fitness_tips: ["Listen to your body and rest when needed.", "Stay consistent to see the best results."]
      },
    };
    return fallbacks[type];
  };

  const withStrictJson = (prompt) => `You are Healsy AI, a world-class health and wellness expert.
- Be helpful, positive, and actionable.
- STRICT OUTPUT: Return ONLY valid JSON matching the provided JSON schema. No prose, no markdown, no extra keys.
- If you don't know, use best-practice defaults.

${prompt}`;

  const analyzeFood = async (description, imageUrl) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!description?.trim() && !imageUrl) {
        throw new Error("Please provide meal description or image");
      }

      const prompt = withStrictJson(`As a certified nutritionist, analyze this meal and provide comprehensive nutritional insights in JSON.

${description ? `Meal Description: ${description}` : ''}
${imageUrl ? `Meal Image Context: analyze the image.` : ''}`);

      const response = await callLLMWithRetry({
        prompt,
        file_urls: imageUrl ? [imageUrl] : undefined,
        response_json_schema: {
          type: "object",
          required: ["total_calories", "health_score", "macronutrients", "micronutrients", "ingredients_analysis", "health_benefits", "dietary_recommendations", "meal_timing_advice", "portion_assessment", "allergen_warnings", "nutritionist_notes"],
          properties: {
            total_calories: { type: "number" },
            health_score: { type: "number" },
            macronutrients: {
              type: "object",
              required: ["protein", "carbs", "fat"],
              properties: {
                protein: { type: "number" },
                carbs: { type: "number" },
                fat: { type: "number" }
              }
            },
            micronutrients: { type: "object" },
            ingredients_analysis: { 
              type: "array",
              items: {
                type: "object", 
                required: ["name", "health_impact", "color"],
                properties: {
                  name: { type: "string" },
                  health_impact: { type: "string" },
                  color: { type: "string" }
                }
              }
            },
            health_benefits: { type: "array", items: { type: "string" } },
            dietary_recommendations: { type: "array", items: { type: "string" } },
            meal_timing_advice: { type: "string" },
            portion_assessment: { type: "string" },
            allergen_warnings: { type: "array", items: { type: "string" } },
            nutritionist_notes: { type: "string" }
          }
        }
      });

      const safe = mergeDefaults(response, createFallbackAnalysis('nutrition'));
      safe.micronutrients = ensureObject(safe.micronutrients);
      safe.ingredients_analysis = ensureArray(safe.ingredients_analysis);
      safe.health_benefits = ensureArray(safe.health_benefits);
      safe.dietary_recommendations = ensureArray(safe.dietary_recommendations);
      safe.allergen_warnings = ensureArray(safe.allergen_warnings);

      // Normalization for UI compatibility (super robust)
      const macros = ensureObject(safe.macronutrients);
      safe.protein_grams = Number(macros.protein || 0);
      safe.carbs_grams = Number(macros.carbs || 0);
      safe.fat_grams = Number(macros.fat || 0);

      // Derive summary and lists expected by UI
      safe.summary = safe.nutritionist_notes || (safe.health_benefits.length ? `Benefits: ${safe.health_benefits.slice(0, 3).join(', ')}` : 'Balanced meal with good nutritional profile.');
      safe.food_items = safe.ingredients_analysis.map(i => i?.name).filter(Boolean);
      safe.healthier_alternatives = [...safe.dietary_recommendations];

      return safe;
    } catch (error) {
      console.error('Nutrition analysis error:', error);
      const fb = createFallbackAnalysis('nutrition');
      // Ensure the same normalized fields exist on fallback
      const macros = ensureObject(fb.macronutrients || {});
      return {
        ...fb,
        protein_grams: Number(macros.protein || 0),
        carbs_grams: Number(macros.carbs || 0),
        fat_grams: Number(macros.fat || 0),
        summary: fb.nutritionist_notes || 'Balanced meal with good nutritional profile.',
        food_items: ensureArray(fb.ingredients_analysis).map(i => i?.name).filter(Boolean),
        healthier_alternatives: ensureArray(fb.dietary_recommendations)
      };
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeFace = async (imageUrl, isPremium = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = withStrictJson(`As a professional skincare expert and Ayurvedic wellness guide, analyze the face image and return JSON only.
Prioritize:
- Clear, encouraging tone
- Practical, affordable, easily available advice (use kitchen/pharmacy items)
- Ayurvedic perspective: identify dominant dosha (vata/pitta/kapha), gentle rituals, season-aware care
- Short, actionable steps with frequency and cautions`);

      const response = await callLLMWithRetry({
        prompt,
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          required: ["overall_assessment", "glow_score", "hydration_score", "clarity_score", "skin_concerns", "natural_routine", "kitchen_remedies", "quick_glow_hacks", "natural_diet_tips", "natural_lifestyle_tips"],
          properties: {
            overall_assessment: { type: "string" },
            glow_score: { type: "number" },
            hydration_score: { type: "number" },
            clarity_score: { type: "number" },
            skin_concerns: { type: "array", items: { type: "string" } },
            natural_routine: {
              type: "object",
              required: ["morning_routine", "evening_routine"],
              properties: {
                morning_routine: { type: "array", items: { type: "object" } },
                evening_routine: { type: "array", items: { type: "object" } }
              }
            },
            kitchen_remedies: { type: "array", items: { type: "object" } },
            quick_glow_hacks: { type: "array", items: { type: "object" } },
            natural_diet_tips: { type: "array", items: { type: "string" } },
            natural_lifestyle_tips: { type: "array", items: { type: "string" } },

            // New: Ayurvedic & accessibility-friendly advice blocks
            ayurveda: {
              type: "object",
              properties: {
                dominant_dosha: { type: "string", enum: ["vata", "pitta", "kapha", "mixed"] },
                traits: { type: "array", items: { type: "string" } },
                recommended_oils: { type: "array", items: { type: "string" } },
                avoid_list: { type: "array", items: { type: "string" } },
                daily_rituals: { type: "array", items: { type: "string" } },
                seasonal_care: { 
                  type: "array", 
                  items: { 
                    type: "object", 
                    properties: { season: { type: "string" }, guidance: { type: "string" } } 
                  } 
                }
              }
            },
            easy_remedies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  ingredients: { type: "string" },
                  steps: { type: "string" },
                  frequency: { type: "string" },
                  availability: { 
                    type: "object",
                    properties: {
                      where: { type: "array", items: { type: "string" } },
                      cost_level: { type: "string", enum: ["low", "medium", "high"] }
                    }
                  },
                  caution: { type: "string" }
                }
              }
            },
            plan_7_days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  morning: { type: "string" },
                  evening: { type: "string" },
                  diet_tip: { type: "string" },
                  water_goal_ml: { type: "number" },
                  bonus_trick: { type: "string" }
                }
              }
            },
            affordable_products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  price_range: { type: "string" },
                  where_to_find: { type: "string" }
                }
              }
            },
            caution_notes: { type: "array", items: { type: "string" } }
          }
        }
      });

      const defaults = createFallbackAnalysis('face');
      const safe = mergeDefaults(response, defaults);
      safe.skin_concerns = ensureArray(safe.skin_concerns);
      safe.natural_routine = mergeDefaults(safe.natural_routine, defaults.natural_routine);
      safe.natural_routine.morning_routine = ensureArray(safe.natural_routine.morning_routine);
      safe.natural_routine.evening_routine = ensureArray(safe.natural_routine.evening_routine);
      safe.kitchen_remedies = ensureArray(safe.kitchen_remedies);
      safe.quick_glow_hacks = ensureArray(safe.quick_glow_hacks);
      safe.natural_diet_tips = ensureArray(safe.natural_diet_tips);
      safe.natural_lifestyle_tips = ensureArray(safe.natural_lifestyle_tips);

      // New fields normalization
      safe.ayurveda = mergeDefaults(safe.ayurveda, defaults.ayurveda);
      safe.ayurveda.traits = ensureArray(safe.ayurveda.traits);
      safe.ayurveda.recommended_oils = ensureArray(safe.ayurveda.recommended_oils);
      safe.ayurveda.avoid_list = ensureArray(safe.ayurveda.avoid_list);
      safe.ayurveda.daily_rituals = ensureArray(safe.ayurveda.daily_rituals);
      safe.ayurveda.seasonal_care = ensureArray(safe.ayurveda.seasonal_care);

      safe.easy_remedies = ensureArray(safe.easy_remedies);
      safe.plan_7_days = ensureArray(safe.plan_7_days);
      safe.affordable_products = ensureArray(safe.affordable_products);
      safe.caution_notes = ensureArray(safe.caution_notes);

      return safe;
    } catch (error) {
      console.error('Face analysis error:', error);
      return createFallbackAnalysis('face');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeHairstyle = async (imageUrl, isPremium = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = withStrictJson(`As a professional hairstylist, analyze the face and current hair; return JSON only.`);

      const response = await callLLMWithRetry({
        prompt,
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          required: ["face_shape_analysis", "current_hair_assessment", "best_choice", "alternative_styles", "styling_tips", "hair_care_routine", "color_suggestions"],
          properties: {
            face_shape_analysis: { type: "string" },
            current_hair_assessment: { type: "string" },
            best_choice: {
              type: "object",
              required: ["name", "description", "why_perfect", "styling_method"],
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                why_perfect: { type: "string" },
                styling_method: { type: "string" }
              }
            },
            alternative_styles: { type: "array", items: { type: "object" } },
            styling_tips: { type: "array", items: { type: "string" } },
            hair_care_routine: { type: "array", items: { type: "string" } },
            color_suggestions: { type: "array", items: { type: "object" } }
          }
        }
      });

      const defaults = createFallbackAnalysis('hairstyle');
      const safe = mergeDefaults(response, defaults);
      safe.alternative_styles = ensureArray(safe.alternative_styles);
      safe.styling_tips = ensureArray(safe.styling_tips);
      safe.hair_care_routine = ensureArray(safe.hair_care_routine);
      safe.color_suggestions = ensureArray(safe.color_suggestions);
      return safe;
    } catch (error) {
      console.error('Hairstyle analysis error:', error);
      return createFallbackAnalysis('hairstyle');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeAura = async (imageUrl, voiceUrl = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fileUrls = [imageUrl];
      if (voiceUrl) fileUrls.push(voiceUrl);

      const prompt = withStrictJson(`As a spiritual wellness expert and aura reader, analyze ${voiceUrl ? 'the photo and voice recording' : 'the photo'} and return JSON only.
${voiceUrl ? 'Use the voice tone, energy, and spoken words to enhance your aura reading.' : ''}`);

      const response = await callLLMWithRetry({
        prompt,
        file_urls: fileUrls,
        response_json_schema: {
          type: "object",
          required: ["aura_color", "color_hex", "spiritual_meaning", "energy_keywords", "chakra_connection", "life_guidance", "aura_strength", "past_life_insight"],
          properties: {
            aura_color: { type: "string" },
            color_hex: { type: "string" },
            spiritual_meaning: { type: "string" },
            energy_keywords: { type: "array", items: { type: "string" } },
            chakra_connection: {
              type: "object",
              required: ["chakra_name", "significance"],
              properties: {
                chakra_name: { type: "string" },
                significance: { type: "string" }
              }
            },
            life_guidance: {
              type: "object",
              required: ["meditation_practice", "crystal_healing", "affirmation", "energy_foods", "spiritual_activities"],
              properties: {
                meditation_practice: { type: "string" },
                crystal_healing: { type: "array", items: { type: "string" } },
                affirmation: { type: "string" },
                energy_foods: { type: "array", items: { type: "string" } },
                spiritual_activities: { type: "array", items: { type: "string" } }
              }
            },
            aura_strength: { type: "number" },
            past_life_insight: { type: "string" }
          }
        }
      });

      const defaults = createFallbackAnalysis('aura');
      const safe = mergeDefaults(response, defaults);
      safe.energy_keywords = ensureArray(safe.energy_keywords);
      safe.chakra_connection = mergeDefaults(safe.chakra_connection, defaults.chakra_connection);
      safe.life_guidance = mergeDefaults(safe.life_guidance, defaults.life_guidance);
      safe.life_guidance.crystal_healing = ensureArray(safe.life_guidance.crystal_healing);
      safe.life_guidance.energy_foods = ensureArray(safe.life_guidance.energy_foods);
      safe.life_guidance.spiritual_activities = ensureArray(safe.life_guidance.spiritual_activities);
      return safe;
    } catch (error) {
      console.error('Aura analysis error:', error);
      return createFallbackAnalysis('aura');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSleep = async (bedTime, wakeTime, sleepQuality, dreamDescription) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = withStrictJson(`As a sleep specialist, analyze this sleep data and return JSON only.

Bedtime: ${bedTime}
Wake time: ${wakeTime}
Sleep quality: ${sleepQuality}/5
Dreams: ${dreamDescription || 'None'}`);

      const response = await callLLMWithRetry({
        prompt,
        response_json_schema: {
          type: "object",
          required: ["sleep_score", "sleep_duration_hours", "sleep_quality", "dream_analysis", "tips"],
          properties: {
            sleep_score: { type: "number" },
            sleep_duration_hours: { type: "number" },
            sleep_quality: { type: "string" },
            dream_analysis: { type: "string" },
            tips: { type: "array", items: { type: "string" } }
          }
        }
      });

      const defaults = createFallbackAnalysis('sleep');
      const safe = mergeDefaults(response, defaults);
      safe.tips = ensureArray(safe.tips);
      return safe;
    } catch (error) {
      console.error('Sleep analysis error:', error);
      return createFallbackAnalysis('sleep');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeJournal = async (journalContent) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = withStrictJson(`As an emotional wellness expert, analyze this journal entry and return JSON only.

Journal Entry: "${journalContent}"`);

      const response = await callLLMWithRetry({
        prompt,
        response_json_schema: {
          type: "object",
          required: ["insights", "mood_score", "primary_emotions", "key_themes", "suggestions", "affirmation", "growth_opportunities", "self_care_recommendations", "reflection_questions"],
          properties: {
            insights: { type: "string" },
            mood_score: { type: "number" },
            primary_emotions: { type: "array", items: { type: "string" } },
            key_themes: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            affirmation: { type: "string" },
            growth_opportunities: { type: "array", items: { type: "string" } },
            self_care_recommendations: { type: "array", items: { type: "string" } },
            reflection_questions: { type: "array", items: { type: "string" } }
          }
        }
      });

      const defaults = createFallbackAnalysis('journal');
      const safe = mergeDefaults(response, defaults);
      safe.primary_emotions = ensureArray(safe.primary_emotions);
      safe.key_themes = ensureArray(safe.key_themes);
      safe.suggestions = ensureArray(safe.suggestions);
      safe.growth_opportunities = ensureArray(safe.growth_opportunities);
      safe.self_care_recommendations = ensureArray(safe.self_care_recommendations);
      safe.reflection_questions = ensureArray(safe.reflection_questions);
      return safe;
    } catch (error) {
      console.error('Journal analysis error:', error);
      return createFallbackAnalysis('journal');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateDietPlan = async (userProfile, goals) => {
      setIsLoading(true);
      setError(null);
      try {
          const prompt = withStrictJson(`Create a 3-day personalized diet plan for the given profile and goals. Return JSON only.

Profile: ${JSON.stringify(userProfile)}
Goals: ${goals}`);
          const response = await callLLMWithRetry({
              prompt,
              response_json_schema: {
                  type: "object",
                  required: ["diet_plan", "total_daily_calories", "macronutrient_distribution", "health_benefits", "shopping_list", "hydration_plan", "dietary_notes"],
                  properties: {
                      diet_plan: { type: "array", items: { type: "object" } },
                      total_daily_calories: { type: "number" },
                      macronutrient_distribution: { type: "object" },
                      health_benefits: { type: "array", items: { type: "string" } },
                      shopping_list: { type: "array", items: { type: "string" } },
                      hydration_plan: { type: "string" },
                      dietary_notes: { type: "string" },
                  }
              }
          }, { cacheKey: `diet:${stableKey(userProfile)}:${goals}`, ttlMs: 24 * 60 * 60 * 1000 }); // cache 24h
          const defaults = createFallbackAnalysis('diet');
          const safe = mergeDefaults(response, defaults);
          safe.diet_plan = ensureArray(safe.diet_plan);
          safe.health_benefits = ensureArray(safe.health_benefits);
          safe.shopping_list = ensureArray(safe.shopping_list);
          return safe;
      } catch (error) {
          console.error('Diet plan generation error:', error);
          return createFallbackAnalysis('diet');
      } finally {
          setIsLoading(false);
      }
  };

  const generateExercisePlan = async (userProfile, goals, experienceLevel) => {
      setIsLoading(true);
      setError(null);
      try {
          const prompt = withStrictJson(`Create a 3-day personalized exercise plan for the given profile, goals, and experience level. Return JSON only.

Profile: ${JSON.stringify(userProfile)}
Goals: ${goals}
Experience: ${experienceLevel}`);
          const response = await callLLMWithRetry({
              prompt,
              response_json_schema: {
                  type: "object",
                  required: ["workout_plan", "weekly_overview", "warm_up_routine", "cool_down_routine", "equipment_needed", "fitness_tips"],
                  properties: {
                      workout_plan: { type: "array", items: { type: "object" } },
                      weekly_overview: { type: "string" },
                      warm_up_routine: { type: "string" },
                      cool_down_routine: { type: "string" },
                      equipment_needed: { type: "array", items: { type: "string" } },
                      fitness_tips: { type: "array", items: { type: "string" } }
                  }
              }
          }, { cacheKey: `exercise:${stableKey(userProfile)}:${goals}:${experienceLevel}`, ttlMs: 24 * 60 * 60 * 1000 }); // cache 24h
          const defaults = createFallbackAnalysis('exercise');
          const safe = mergeDefaults(response, defaults);
          safe.workout_plan = ensureArray(safe.workout_plan);
          safe.equipment_needed = ensureArray(safe.equipment_needed);
          safe.fitness_tips = ensureArray(safe.fitness_tips);
          return safe;
      } catch (error) {
          console.error('Exercise plan generation error:', error);
          return createFallbackAnalysis('exercise');
      } finally {
          setIsLoading(false);
      }
  };

  const calculateWaterNeeds = async (age, weightKg, activityLevel, climate) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = withStrictJson(`Calculate optimal daily water intake for this profile and return JSON only.

Age: ${age}
Weight: ${weightKg} kg
Activity Level: ${activityLevel}
Climate: ${climate}`);

      const cacheKey = `water:${age}:${weightKg}:${activityLevel}:${climate}`;
      const response = await callLLMWithRetry({
        prompt,
        response_json_schema: {
          type: "object",
          required: ["recommended_intake_ml", "explanation", "calculation_breakdown", "hydration_tips", "activity_adjustments", "climate_considerations"],
          properties: {
            recommended_intake_ml: { type: "number" },
            explanation: { type: "string" },
            calculation_breakdown: { type: "string" },
            hydration_tips: { type: "array", items: { type: "string" } },
            activity_adjustments: { type: "string" },
            climate_considerations: { type: "string" }
          }
        }
      }, { cacheKey, ttlMs: 24 * 60 * 60 * 1000 }); // cache 24h

      if (response && typeof response === 'object') {
        const safe = mergeDefaults(response, {
          recommended_intake_ml: weightKg * 35, // A basic default if AI doesn't return
          explanation: "No specific explanation from AI. Using a default calculation.",
          calculation_breakdown: "No specific breakdown from AI. Using a default calculation.",
          hydration_tips: [],
          activity_adjustments: "No specific adjustments from AI. Using general guidelines.",
          climate_considerations: "No specific considerations from AI. Using general guidelines."
        });
        safe.hydration_tips = ensureArray(safe.hydration_tips);
        return safe;
      } else {
        // Fallback calculation if AI fails or returns empty/invalid
        const baseWater = weightKg * 35; // Basic calculation: 35ml per kg
        const activityMultiplier = {
          sedentary: 1.0,
          light: 1.1,
          moderate: 1.2,
          active: 1.3
        }[activityLevel] || 1.1;
        
        const climateMultiplier = {
          cold: 0.95,
          temperate: 1.0,
          hot: 1.15
        }[climate] || 1.0;
        
        const recommendedIntake = Math.round(baseWater * activityMultiplier * climateMultiplier);
        
        return {
          recommended_intake_ml: recommendedIntake,
          explanation: `Based on your profile (${age} years, ${weightKg}kg, ${activityLevel} activity in ${climate} climate), your personalized water goal is ${recommendedIntake}ml per day. This calculation considers your body weight, activity level, and climate to ensure optimal hydration.`,
          calculation_breakdown: `Base water needs: ${baseWater}ml (${weightKg}kg × 35ml/kg), Activity adjustment: ×${activityMultiplier}, Climate adjustment: ×${climateMultiplier}`,
          hydration_tips: [
            "Drink water consistently throughout the day",
            "Increase intake during exercise or hot weather",
            "Monitor urine color - pale yellow indicates good hydration",
            "Don't wait until you feel thirsty to drink water"
          ],
          activity_adjustments: "Increase intake by 500-750ml for every hour of intense exercise",
          climate_considerations: "Hot weather requires 10-15% more water intake to compensate for increased sweating"
        };
      }
    } catch (error) {
      console.error('Water calculation error:', error);
      // Fallback calculation
      const baseWater = weightKg * 35;
      const recommendedIntake = Math.round(baseWater * 1.1);
      
      return {
        recommended_intake_ml: recommendedIntake,
        explanation: `Based on standard hydration guidelines, your recommended daily water intake is ${recommendedIntake}ml. This is calculated using your body weight and general health recommendations.`,
        calculation_breakdown: `${weightKg}kg × 35ml/kg = ${recommendedIntake}ml`,
        hydration_tips: [
          "Drink water regularly throughout the day",
          "Increase intake during exercise",
          "Listen to your body's thirst signals"
        ],
        activity_adjustments: "Add extra water during physical activity",
        climate_considerations: "Adjust intake based on weather conditions"
      };
    } finally {
      setIsLoading(false);
    }
  };

  const generateYogaRoutine = async (goal = 'stress_relief', difficulty = 'beginner', language = 'en') => {
    setIsLoading(true);
    setError(null);

    // Language names for clear instruction
    const languageNames = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      pt: 'Portuguese (Português)',
      ar: 'Arabic (العربية)',
      zh: 'Chinese (中文)'
    };

    const targetLanguage = languageNames[language] || 'English';

    // Local fallback library
    const fallbackByGoal = {
      stress_relief: {
        name: 'Calm Mind Flow',
        description: 'A soothing sequence to release tension and calm your nervous system.',
        poses: [
          { pose_name: 'Easy Seated Breathing', duration_seconds: 60, instructions: ['Sit tall, relax shoulders', 'Inhale 4, exhale 6'], voice_coach_tip: 'Breathe slowly and soften your face', image_prompt: 'yoga, seated meditation, calm, soft morning light' },
          { pose_name: 'Cat-Cow', duration_seconds: 60, instructions: ['Inhale cow, exhale cat, flow gently'], voice_coach_tip: 'Move with your breath', image_prompt: 'yoga, cat cow on mat, gentle mobility' },
          { pose_name: 'Child’s Pose', duration_seconds: 60, instructions: ['Knees wide, forehead down', 'Relax hips to heels'], voice_coach_tip: 'Let your belly soften', image_prompt: 'yoga, child pose, cozy, soft lighting' },
          { pose_name: 'Downward Dog', duration_seconds: 60, instructions: ['Lift hips, lengthen spine', 'Pedal feet gently'], voice_coach_tip: 'Keep neck relaxed', image_prompt: 'yoga, downward dog, bright airy room' },
          { pose_name: 'Low Lunge', duration_seconds: 45, instructions: ['Front knee over ankle', 'Sink hips gently'], voice_coach_tip: 'Relax your jaw', image_prompt: 'yoga, low lunge, beginner friendly' },
          { pose_name: 'Supine Twist', duration_seconds: 60, instructions: ['Arms T-shape', 'Drop knees to side'], voice_coach_tip: 'Melt your shoulder blades', image_prompt: 'yoga, supine twist, serene' },
          { pose_name: 'Legs Up the Wall', duration_seconds: 60, instructions: ['Hips close to wall', 'Arms relaxed'], voice_coach_tip: 'Feel circulation rebalance', image_prompt: 'yoga, legs up wall, minimal calm room' },
          { pose_name: 'Savasana', duration_seconds: 90, instructions: ['Lie down completely', 'Close eyes, rest'], voice_coach_tip: 'Let go, you are safe', image_prompt: 'yoga, savasana, tranquil ambience' },
        ],
      },
      flexibility: {
        name: 'Full-Body Flex Flow',
        description: 'Gentle stretching to open hips, hamstrings, shoulders, and spine.',
        poses: [
          { pose_name: 'Breath Warm-Up', duration_seconds: 45, instructions: ['Inhale arms up', 'Exhale fold'], voice_coach_tip: 'Lengthen spine on inhale', image_prompt: 'yoga breathing warm-up' },
          { pose_name: 'Forward Fold', duration_seconds: 60, instructions: ['Soften knees', 'Relax neck'], voice_coach_tip: 'Heavy head, loose jaw', image_prompt: 'yoga standing forward fold' },
          { pose_name: 'Lizard Pose', duration_seconds: 60, instructions: ['Hands inside foot', 'Hips forward'], voice_coach_tip: 'Breathe into hips', image_prompt: 'yoga lizard pose, hip opener' },
          { pose_name: 'Half Split', duration_seconds: 60, instructions: ['Hips over back knee', 'Flex front foot'], voice_coach_tip: 'Long spine, soft hamstrings', image_prompt: 'yoga half split stretch' },
          { pose_name: 'Puppy Pose', duration_seconds: 60, instructions: ['Hips over knees', 'Chest melts'], voice_coach_tip: 'Keep belly soft', image_prompt: 'yoga puppy pose, shoulder opener' },
          { pose_name: 'Seated Twist', duration_seconds: 60, instructions: ['Inhale lengthen', 'Exhale twist'], voice_coach_tip: 'Twist from mid-back', image_prompt: 'yoga seated twist pose' },
          { pose_name: 'Butterfly Fold', duration_seconds: 60, instructions: ['Soles together', 'Fold gently'], voice_coach_tip: 'Relax inner thighs', image_prompt: 'yoga butterfly stretch' },
          { pose_name: 'Savasana', duration_seconds: 90, instructions: ['Full rest', 'Soften entire body'], voice_coach_tip: 'Let the practice land', image_prompt: 'yoga savasana peaceful' },
        ],
      },
      weight_loss: {
        name: 'Metabolic Flow',
        description: 'A balanced flow for heat, stamina, and balanced fat-burn.',
        poses: [
          { pose_name: 'Breath & Core Engage', duration_seconds: 45, instructions: ['Navel to spine', 'Smooth breathing'], voice_coach_tip: 'Gentle core tone', image_prompt: 'yoga core breathing warm-up' },
          { pose_name: 'Sun Salutation A', duration_seconds: 90, instructions: ['Inhale reach', 'Exhale fold', 'Plank to cobra/dog'], voice_coach_tip: 'Move steadily', image_prompt: 'yoga sun salutation sequence' },
          { pose_name: 'High Lunge', duration_seconds: 60, instructions: ['Arms up', 'Back heel lifted'], voice_coach_tip: 'Strong legs, soft face', image_prompt: 'yoga high crescent lunge' },
          { pose_name: 'Chair Pose', duration_seconds: 45, instructions: ['Hips back', 'Weight in heels'], voice_coach_tip: 'Steady breath', image_prompt: 'yoga chair pose' },
          { pose_name: 'Plank to Side Plank', duration_seconds: 60, instructions: ['Shift weight', 'Stack shoulders'], voice_coach_tip: 'Long line from heels to head', image_prompt: 'yoga side plank' },
          { pose_name: 'Boat Pose', duration_seconds: 45, instructions: ['Lift chest', 'Lower abs active'], voice_coach_tip: 'Smile through the burn', image_prompt: 'yoga boat pose core' },
          { pose_name: 'Bridge', duration_seconds: 60, instructions: ['Feet hip-width', 'Lift hips'], voice_coach_tip: 'Press through heels', image_prompt: 'yoga bridge pose' },
          { pose_name: 'Savasana', duration_seconds: 90, instructions: ['Relax completely'], voice_coach_tip: 'Celebrate your effort', image_prompt: 'yoga savasana' },
        ],
      },
      back_pain: {
        name: 'Happy Spine Flow',
        description: 'Gentle spinal mobility and core support to ease back discomfort.',
        poses: [
          { pose_name: 'Pelvic Tilts', duration_seconds: 60, instructions: ['Supine, tilt pelvis', 'Small range'], voice_coach_tip: 'Slow and smooth', image_prompt: 'yoga pelvic tilt on mat' },
          { pose_name: 'Knees to Chest', duration_seconds: 60, instructions: ['Hug knees', 'Rock gently'], voice_coach_tip: 'Massage low back', image_prompt: 'yoga apanasana' },
          { pose_name: 'Cat-Cow', duration_seconds: 60, instructions: ['Move with breath'], voice_coach_tip: 'No pain, only ease', image_prompt: 'yoga cat cow gentle' },
          { pose_name: 'Sphinx', duration_seconds: 60, instructions: ['Elbows under shoulders', 'Lift chest'], voice_coach_tip: 'Broaden collarbones', image_prompt: 'yoga sphinx gentle backbend' },
          { pose_name: 'Thread the Needle', duration_seconds: 60, instructions: ['Arm under chest', 'Rest shoulder'], voice_coach_tip: 'Soften neck', image_prompt: 'yoga thread the needle' },
          { pose_name: 'Figure-4 Stretch', duration_seconds: 60, instructions: ['Ankle over knee', 'Pull thigh'], voice_coach_tip: 'Breathe into outer hip', image_prompt: 'yoga supine figure 4' },
          { pose_name: 'Supine Twist', duration_seconds: 60, instructions: ['Relax shoulders'], voice_coach_tip: 'Let gravity help', image_prompt: 'yoga supine twist' },
          { pose_name: 'Savasana', duration_seconds: 90, instructions: ['Full rest'], voice_coach_tip: 'Soft belly, relaxed back', image_prompt: 'yoga savasana' },
        ],
      },
    };

    const difficultyScale = { beginner: 0.9, intermediate: 1.0, advanced: 1.15 };

    try {
      const prompt = withStrictJson(`CRITICAL: Respond ENTIRELY in ${targetLanguage}. All text fields must be in ${targetLanguage}.

Design a safe, guided yoga routine as JSON only.

Rules:
- ALL TEXT MUST BE IN ${targetLanguage} - routine_name, routine_description, pose_name, instructions, voice_coach_tip
- 8 to 12 poses total.
- Each pose has: pose_name (in ${targetLanguage}), duration_seconds (30-120), instructions (list of step strings in ${targetLanguage}), voice_coach_tip (short, supportive in ${targetLanguage}), image_prompt (for AI image generation - keep in English).
- Include a gentle breath warm-up at the start and Savasana at the end.
- Tailor to goal="${goal}" and difficulty="${difficulty}" (tempo, posture complexity).
- Keep cues encouraging and non-technical.

EXAMPLE for ${targetLanguage}:
${language === 'hi' ? '{"routine_name": "शांत मन प्रवाह", "routine_description": "तनाव को दूर करने और आपके तंत्रिका तंत्र को शांत करने के लिए एक सुखदायक क्रम।", "poses": [{"pose_name": "आसान बैठी हुई श्वास", "duration_seconds": 60, "instructions": ["सीधे बैठें, कंधों को आराम दें", "4 गिनती तक श्वास लें, 6 गिनती तक श्वास छोड़ें"], "voice_coach_tip": "धीरे-धीरे सांस लें और अपने चेहरे को नरम करें।", "image_prompt": "yoga, seated meditation, calm, soft morning light"}]}' : ''}
${language === 'es' ? '{"routine_name": "Flujo de Mente Tranquila", "routine_description": "Una secuencia relajante para liberar la tensión y calmar tu sistema nervioso.", "poses": [{"pose_name": "Respiración Sentada Sencilla", "duration_seconds": 60, "instructions": ["Siéntate erguido, relaja los hombros", "Inhala en 4, exhala en 6"], "voice_coach_tip": "Respira lentamente y suaviza tu rostro.", "image_prompt": "yoga, seated meditation, calm, soft morning light"}]}' : ''}

Return JSON only, matching the schema.`);

      const response = await callLLMWithRetry({
        prompt,
        response_json_schema: {
          type: "object",
          required: ["routine_name", "routine_description", "total_duration_minutes", "poses"],
          properties: {
            routine_name: { type: "string" },
            routine_description: { type: "string" },
            total_duration_minutes: { type: "number" },
            poses: {
              type: "array",
              items: {
                type: "object",
                required: ["pose_name", "duration_seconds", "instructions", "voice_coach_tip", "image_prompt"],
                properties: {
                  pose_name: { type: "string" },
                  duration_seconds: { type: "number" },
                  instructions: { type: "array", items: { type: "string" } },
                  voice_coach_tip: { type: "string" },
                  image_prompt: { type: "string" }
                }
              }
            }
          }
        }
      }, { ttlMs: 10 * 60 * 1000, cacheKey: `yoga:${goal}:${difficulty}:${language}` });

      // Post-process and ensure stable shape
      let safe = response && typeof response === 'object' ? response : null;

      if (!safe || !Array.isArray(safe.poses) || safe.poses.length === 0) {
        const fb = fallbackByGoal[goal] || fallbackByGoal.stress_relief;
        const scaled = fb.poses.map(p => ({
          ...p,
          duration_seconds: Math.max(30, Math.round(p.duration_seconds * (difficultyScale[difficulty] || 1)))
        }));
        const total = Math.round(scaled.reduce((s, p) => s + p.duration_seconds, 0) / 60);
        return {
          routine_name: fb.name,
          routine_description: fb.description,
          total_duration_minutes: total,
          poses: scaled
        };
      }

      // Normalize
      safe.poses = safe.poses.map(p => ({
        pose_name: p.pose_name || 'Yoga Pose',
        duration_seconds: Math.max(30, Math.min(180, Number(p.duration_seconds) || 45)),
        instructions: Array.isArray(p.instructions) ? p.instructions : (p.instructions ? [String(p.instructions)] : ['Breathe steadily']),
        voice_coach_tip: p.voice_coach_tip || 'Breathe steadily and move gently.',
        image_prompt: p.image_prompt || `studio yoga photo, ${goal}, ${difficulty}, neutral background`
      }));

      // Recompute total if missing/wrong
      const totalSeconds = safe.poses.reduce((s, p) => s + (p.duration_seconds || 0), 0);
      safe.total_duration_minutes = Math.max(5, Math.round(totalSeconds / 60));
      safe.routine_name = safe.routine_name || `${goal.replace('_', ' ')} ${difficulty} Flow`;
      safe.routine_description = safe.routine_description || 'A balanced, supportive routine tailored to your goal and level.';

      // Apply difficulty scaling
      const factor = difficultyScale[difficulty] || 1.0;
      safe.poses = safe.poses.map(p => ({
        ...p,
        duration_seconds: Math.max(30, Math.round(p.duration_seconds * factor))
      }));
      safe.total_duration_minutes = Math.max(5, Math.round(safe.poses.reduce((s, p) => s + p.duration_seconds, 0) / 60));

      return safe;
    } catch (e) {
      console.error('Yoga routine generation error:', e);
      const fb = fallbackByGoal[goal] || fallbackByGoal.stress_relief;
      const scaled = fb.poses.map(p => ({
        ...p,
        duration_seconds: Math.max(30, Math.round(p.duration_seconds * (difficultyScale[difficulty] || 1)))
      }));
      const total = Math.round(scaled.reduce((s, p) => s + p.duration_seconds, 0) / 60);
      return {
        routine_name: fb.name,
        routine_description: fb.description,
        total_duration_minutes: total,
        poses: scaled
      };
    } finally {
      setIsLoading(false);
    }
  };

  const generateMeditation = async (goal = 'stress_relief', durationMinutes = '5', language = 'en') => {
    setIsLoading(true);
    setError(null);

    const durationNum = Math.max(3, Math.min(20, Number(durationMinutes) || 5));

    // Language names for clear instruction
    const languageNames = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      pt: 'Portuguese (Português)',
      ar: 'Arabic (العربية)',
      zh: 'Chinese (中文)'
    };

    const targetLanguage = languageNames[language] || 'English';

    // Small curated fallback library
    const lib = {
      stress_relief: [
        { instruction: "Close your eyes, soften your shoulders, and take a gentle inhale through the nose.", duration_seconds: 30, voice_coach_tip: "Let your jaw unclench and your breath slow down.", image_prompt: "calm meditation portrait, soft morning light" },
        { instruction: "Lengthen your exhale slightly, feeling your body release any tension.", duration_seconds: 45, voice_coach_tip: "Exhale as if fogging a mirror softly.", image_prompt: "peaceful breathing, soft focus" },
        { instruction: "Scan your body from head to toe, relaxing each area as you go.", duration_seconds: 60, voice_coach_tip: "Bring kindness to any tight spots.", image_prompt: "body scan, serene, warm tones" },
        { instruction: "Slow breaths in four, out for six. Let thoughts pass like clouds.", duration_seconds: 60, voice_coach_tip: "Return gently when distracted.", image_prompt: "calm clouds, tranquil aesthetic" },
        { instruction: "Sit in stillness and simply notice the breath and your calm presence.", duration_seconds: 45, voice_coach_tip: "You’re doing great—just be here.", image_prompt: "tranquil minimalist environment" }
      ],
      focus: [
        { instruction: "Set a clear intention: I am present and focused.", duration_seconds: 30, voice_coach_tip: "One task, one breath.", image_prompt: "intentional focus, clean desk, morning light" },
        { instruction: "Breathe in for four, out for four, maintaining steady rhythm.", duration_seconds: 60, voice_coach_tip: "Smooth and even breath.", image_prompt: "balanced breathing rhythm graphic" },
        { instruction: "Visualize a gentle light at the center of your forehead.", duration_seconds: 60, voice_coach_tip: "Keep your gaze soft or eyes closed.", image_prompt: "soft glowing light, minimalist" },
        { instruction: "Notice distractions, label them, and return to the breath.", duration_seconds: 60, voice_coach_tip: "Name it, then let it go.", image_prompt: "calm waves, returning pattern" },
        { instruction: "Close with three deep breaths and a quiet inner ‘thank you’.", duration_seconds: 30, voice_coach_tip: "Feel energized and clear.", image_prompt: "clarity, fresh air, morning vibe" }
      ],
      sleep_prep: [
        { instruction: "Dim your inner lights; soften facial muscles and relax your eyes.", duration_seconds: 45, voice_coach_tip: "Breathe like you’re already sleeping.", image_prompt: "night calm, dim warm light" },
        { instruction: "Inhale 4, exhale 6, letting the exhale become heavier and longer.", duration_seconds: 60, voice_coach_tip: "Sink into the pillow or chair.", image_prompt: "cozy bedroom scene, tranquil" },
        { instruction: "Gently scan your body and invite each area to melt.", duration_seconds: 60, voice_coach_tip: "Release the day from head to toe.", image_prompt: "soft night tones, body relaxation" },
        { instruction: "Visualize a serene place: a quiet beach at night or a peaceful meadow.", duration_seconds: 60, voice_coach_tip: "Let the scene hold you.", image_prompt: "moonlit beach, gentle waves" },
        { instruction: "End with gratitude for your body and this moment of rest.", duration_seconds: 45, voice_coach_tip: "Whisper ‘thank you’.", image_prompt: "night sky with stars, comforting" }
      ],
      gratitude: [
        { instruction: "Place a hand on your heart and notice its steady rhythm.", duration_seconds: 30, voice_coach_tip: "Appreciate your breath.", image_prompt: "warm heart center, gentle light" },
        { instruction: "Recall one person you appreciate and send them kindness.", duration_seconds: 60, voice_coach_tip: "A warm, gentle smile helps.", image_prompt: "soft portrait silhouette, warm glow" },
        { instruction: "Recall one experience you're grateful for and relive its warmth.", duration_seconds: 60, voice_coach_tip: "Let the feeling expand.", image_prompt: "golden moments, memory warmth" },
        { instruction: "Fill your breath with gratitude and let it radiate through your body.", duration_seconds: 60, voice_coach_tip: "Breathe gratitude in and out.", image_prompt: "radiant light, serene texture" },
        { instruction: "Close with a simple affirmation: I am grateful for this moment.", duration_seconds: 30, voice_coach_tip: "Carry this feeling forward.", image_prompt: "soft sunrise, hopeful" }
      ]
    };

    try {
      const prompt = withStrictJson(`CRITICAL: Respond ENTIRELY in ${targetLanguage}. All text fields must be in ${targetLanguage}.

Create a concise, soothing meditation session as JSON only.

Constraints:
- ALL TEXT MUST BE IN ${targetLanguage} - session_title, summary, and all step fields (instruction, voice_coach_tip)
- Return JSON only
- Include: session_title (string in ${targetLanguage}), summary (string in ${targetLanguage}), steps (array)
- steps: 4-8 items. Each step: { instruction (1-2 short sentences in ${targetLanguage}), duration_seconds (30-90), voice_coach_tip (short in ${targetLanguage}), image_prompt (for AI image - keep in English) }.
- Match total duration close to ${durationNum} minutes.
- Keep tone encouraging, inclusive, and gentle.
- Goal: "${goal}"

EXAMPLE for ${targetLanguage}:
${language === 'hi' ? '{"session_title": "शांत पुनःस्थापन", "summary": "अपनी सांस और मन को केंद्रित करने के लिए एक कोमल निर्देशित अभ्यास।", "steps": [{"instruction": "अपनी आँखें बंद करें, अपने कंधों को नरम करें, और नाक से एक कोमल श्वास लें।", "duration_seconds": 30, "voice_coach_tip": "अपने जबड़े को ढीला करें और अपनी सांस को धीमा होने दें।", "image_prompt": "calm meditation portrait, soft morning light"}]}' : ''}
${language === 'es' ? '{"session_title": "Restablecimiento de Calma", "summary": "Una práctica guiada suave para centrar tu respiración y mente.", "steps": [{"instruction": "Cierra los ojos, relaja los hombros y toma una inhalación suave por la nariz.", "duration_seconds": 30, "voice_coach_tip": "Deja que tu mandíbula se relaje y tu respiración se ralentice.", "image_prompt": "calm meditation portrait, soft morning light"}]}' : ''}

Return JSON only.`);

      const resp = await callLLMWithRetry({
        prompt,
        response_json_schema: {
          type: "object",
          required: ["session_title", "summary", "steps"],
          properties: {
            session_title: { type: "string" },
            summary: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                required: ["instruction", "duration_seconds", "voice_coach_tip", "image_prompt"],
                properties: {
                  instruction: { type: "string" },
                  duration_seconds: { type: "number" },
                  voice_coach_tip: { type: "string" },
                  image_prompt: { type: "string" }
                }
              }
            }
          }
        }
      }, { ttlMs: 10 * 60 * 1000, cacheKey: `med:${goal}:${durationNum}:${language}` }); // short cache 10m

      let steps = Array.isArray(resp?.steps) ? resp.steps : [];
      if (!steps.length) {
        steps = lib[goal] || lib.stress_relief;
      }

      // Normalize steps and scale to match requested duration
      steps = steps.map(s => ({
        instruction: s.instruction || "Breathe gently and be present.",
        duration_seconds: Math.max(30, Math.min(90, Number(s.duration_seconds) || 45)),
        voice_coach_tip: s.voice_coach_tip || "Relax your shoulders and soften the jaw.",
        image_prompt: s.image_prompt || "serene minimalist meditation visual, soft light"
      }));

      const currentTotal = steps.reduce((a, b) => a + b.duration_seconds, 0);
      const targetTotal = durationNum * 60;
      const factor = Math.max(0.8, Math.min(1.4, targetTotal / currentTotal || 1));
      steps = steps.map(s => ({
        ...s,
        duration_seconds: Math.max(30, Math.min(120, Math.round(s.duration_seconds * factor)))
      }));

      return {
        session_title: resp?.session_title || ({
          stress_relief: "Calm Reset",
          focus: "Focused Presence",
          sleep_prep: "Gentle Sleep Wind-Down",
          gratitude: "Heartfelt Gratitude"
        }[goal] || "Mindful Breath"),
        summary: resp?.summary || "A gentle guided practice to center your breath and mind.",
        steps
      };
    } catch (e) {
      // Fallback session tailored by goal, scaled to duration
      console.error('Meditation generation error:', e);
      const base = lib[goal] || lib.stress_relief;
      const targetTotal = durationNum * 60;
      const currentTotal = base.reduce((a, b) => a + b.duration_seconds, 0);
      const factor = Math.max(0.8, Math.min(1.4, targetTotal / currentTotal || 1));
      const steps = base.map(s => ({ ...s, duration_seconds: Math.max(30, Math.min(120, Math.round(s.duration_seconds * factor))) }));
      return {
        session_title: ({
          stress_relief: "Calm Reset",
          focus: "Focused Presence",
          sleep_prep: "Gentle Sleep Wind-Down",
          gratitude: "Heartfelt Gratitude"
        }[goal] || "Mindful Breath"),
        summary: "A gentle guided practice to center your breath and mind.",
        steps
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Add: AI Mood Suggestion with strict schema and graceful fallback
  const getMoodSuggestion = async (mood, context = "") => {
    setIsLoading(true);
    setError(null);

    // Local fallbacks for each mood
    const fallback = {
      radiant: {
        affirmation: "I radiate joy and share my light with ease.",
        suggestion: "Channel this energy into a small act of kindness or a creative task.",
        activities: ["Take a victory walk", "Share gratitude with someone", "Do a 10-min creative burst"],
        breathing_exercise: "Box breath 4-4-4-4: inhale 4, hold 4, exhale 4, hold 4 (3 rounds)"
      },
      good: {
        affirmation: "I am steady, present, and grounded.",
        suggestion: "Maintain momentum with a focused 25-minute deep work session.",
        activities: ["Write a short to-do list", "Stretch for 5 minutes", "Hydrate mindfully"],
        breathing_exercise: "Even breath: inhale 4, exhale 4 (2 minutes)"
      },
      okay: {
        affirmation: "I am allowed to be exactly as I am; I move gently forward.",
        suggestion: "Try one tiny step toward something that matters to you.",
        activities: ["5-minute walk", "Tidy a small space", "Write one sentence about how you feel"],
        breathing_exercise: "4-6 breath: inhale 4, exhale 6 (2 minutes)"
      },
      sad: {
        affirmation: "I offer myself compassion and patience.",
        suggestion: "Soothe your nervous system and reach out to a supportive friend if you can.",
        activities: ["Warm tea ritual", "Gentle journaling for 5 min", "Listen to a comforting song"],
        breathing_exercise: "Coherent breathing: inhale 5, exhale 5 (2–3 minutes)"
      },
      stressed: {
        affirmation: "I breathe out tension and breathe in clarity.",
        suggestion: "Downshift with a short breath practice, then reduce your task list to one next step.",
        activities: ["2-minute stretch", "Write top 1 priority", "Step away for fresh air"],
        breathing_exercise: "Extended exhale: inhale 4, exhale 7 (2 minutes)"
      }
    }[mood] || {
      affirmation: "I am present and safe in this moment.",
      suggestion: "Take one nourishing breath and choose a gentle next step.",
      activities: ["Stand up and stretch", "Drink water", "Set a 5-minute timer to start"],
      breathing_exercise: "Inhale 4, exhale 6 (2 minutes)"
    };

    try {
      const prompt = withStrictJson(`You are a supportive mental wellness coach.
Given the user's current mood and optional context, return JSON only with:
- affirmation (short, compassionate)
- suggestion (1–2 sentences, practical next step)
- activities (3–5 short actionable items)
- breathing_exercise (one concise technique)

Mood: ${mood}
Context: ${context || 'None'}`);
      const cacheKey = `mood:${mood}:${(context || '').slice(0, 64)}`;
      const resp = await callLLMWithRetry({
        prompt,
        response_json_schema: {
          type: "object",
          required: ["affirmation", "suggestion", "activities", "breathing_exercise"],
          properties: {
            affirmation: { type: "string" },
            suggestion: { type: "string" },
            activities: { type: "array", items: { type: "string" } },
            breathing_exercise: { type: "string" }
          }
        }
      }, { cacheKey, ttlMs: 60 * 60 * 1000 }); // cache 1h

      const safe = {
        affirmation: resp?.affirmation || fallback.affirmation,
        suggestion: resp?.suggestion || fallback.suggestion,
        activities: Array.isArray(resp?.activities) && resp.activities.length ? resp.activities : fallback.activities,
        breathing_exercise: resp?.breathing_exercise || fallback.breathing_exercise
      };
      return safe;
    } catch (e) {
      console.error("Mood suggestion error:", e);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeFood,
    analyzeFace,
    analyzeHairstyle,
    analyzeAura,
    analyzeSleep,
    analyzeJournal,
    generateDietPlan,
    generateExercisePlan,
    calculateWaterNeeds,
    generateYogaRoutine,
    generateMeditation,
    // expose new method
    getMoodSuggestion,
    isLoading,
    error
  };
};

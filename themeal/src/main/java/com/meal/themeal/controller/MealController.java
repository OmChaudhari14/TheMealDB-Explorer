package com.meal.themeal.controller;

import com.meal.themeal.service.MealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend to call if served separately, or just good practice
public class MealController {

    @Autowired
    private MealService mealService;

    @GetMapping("/search")
    public Object searchMeals(@RequestParam(value = "q", defaultValue = "") String query) {
        return mealService.searchMeals(query);
    }

    @GetMapping("/categories")
    public Object getCategories() {
        return mealService.getCategories();
    }

    @GetMapping("/meal/{id}")
    public Object getMealById(@PathVariable String id) {
        return mealService.getMealById(id);
    }

    @GetMapping("/random")
    public Object getRandomMeal() {
        return mealService.getRandomMeal();
    }

    @GetMapping("/category/{name}")
    public Object filterByCategory(@PathVariable String name) {
        return mealService.filterByCategory(name);
    }

    @GetMapping("/health")
    public String health() {
        return "Backend is running!";
    }
}

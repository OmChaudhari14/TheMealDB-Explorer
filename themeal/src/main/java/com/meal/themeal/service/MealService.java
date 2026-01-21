package com.meal.themeal.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MealService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BASE_URL = "https://www.themealdb.com/api/json/v1/1";

    // Simple In-Memory Cache
    // Key: URL/Identifier, Value: CacheEntry (Data + Expiry)
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final long DEFAULT_TTL = 300 * 1000; // 5 minutes
    private final long CATEGORY_TTL = 24 * 60 * 60 * 1000; // 24 hours

    private static class CacheEntry {
        Object data;
        long expiryTime;

        CacheEntry(Object data, long expiryTime) {
            this.data = data;
            this.expiryTime = expiryTime;
        }
    }

    private Object getFromCache(String key) {
        CacheEntry entry = cache.get(key);
        if (entry != null) {
            if (System.currentTimeMillis() < entry.expiryTime) {
                System.out.println("Cache Hit: " + key);
                return entry.data;
            } else {
                cache.remove(key);
            }
        }
        return null;
    }

    private void addToCache(String key, Object data, long ttl) {
        // Simple size limit check
        if (cache.size() > 100) {
            cache.clear(); // Naive cleanup
        }
        cache.put(key, new CacheEntry(data, System.currentTimeMillis() + ttl));
    }

    public Object searchMeals(String query) {
        String key = "search_" + query;
        Object cached = getFromCache(key);
        if (cached != null)
            return cached;

        String url = BASE_URL + "/search.php?s=" + query;
        Object response = restTemplate.getForObject(url, Object.class);

        // Fallback: If no meals found by name, try searching by category
        boolean found = false;
        if (response instanceof java.util.Map) {
            java.util.Map<?, ?> map = (java.util.Map<?, ?>) response;
            if (map.get("meals") != null) {
                found = true;
            }
        }

        if (!found) {
            try {
                String catUrl = BASE_URL + "/filter.php?c=" + query;
                Object catResponse = restTemplate.getForObject(catUrl, Object.class);
                if (catResponse instanceof java.util.Map) {
                    java.util.Map<?, ?> catMap = (java.util.Map<?, ?>) catResponse;
                    if (catMap.get("meals") != null) {
                        response = catResponse;
                    }
                }
            } catch (Exception e) {
                // Ignore fallback error
            }
        }

        addToCache(key, response, DEFAULT_TTL);
        return response;
    }

    public Object getCategories() {
        String key = "categories";
        Object cached = getFromCache(key);
        if (cached != null)
            return cached;

        String url = BASE_URL + "/categories.php";
        Object response = restTemplate.getForObject(url, Object.class);
        addToCache(key, response, CATEGORY_TTL);
        return response;
    }

    public Object getMealById(String id) {
        String key = "meal_" + id;
        Object cached = getFromCache(key);
        if (cached != null)
            return cached;

        String url = BASE_URL + "/lookup.php?i=" + id;
        Object response = restTemplate.getForObject(url, Object.class);
        addToCache(key, response, DEFAULT_TTL);
        return response;
    }

    public Object getRandomMeal() {
        // No caching for random
        String url = BASE_URL + "/random.php";
        return restTemplate.getForObject(url, Object.class);
    }

    public Object filterByCategory(String category) {
        String key = "cat_" + category;
        Object cached = getFromCache(key);
        if (cached != null)
            return cached;

        String url = BASE_URL + "/filter.php?c=" + category;
        Object response = restTemplate.getForObject(url, Object.class);
        addToCache(key, response, DEFAULT_TTL);
        return response;
    }

}

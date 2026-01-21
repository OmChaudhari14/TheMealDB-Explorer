# TheMealDB Explorer

A Spring Boot application that provides a unified interface to explore recipes from TheMealDB.

## Architecture

*   **Backend**: Java Spring Boot (Proxy API + In-Memory Caching)
*   **Frontend**: Vanilla HTML/CSS/JS (served via Spring Static Resources)

## Prerequisites

*   Java JDK 17 or higher
*   Maven (optional, wrapper provided)

## How to Run

### Option 1: Using Terminal (Recommended)

1.  Open the terminal in this directory (`themeal`).
2.  Run the application using the Maven wrapper:
    *   **Windows**:
        ```powershell
        .\mvnw spring-boot:run
        ```
    *   **Mac/Linux**:
        ```bash
        ./mvnw spring-boot:run
        ```

### Option 2: Using VS Code Java Extensions

1.  Open `src/main/java/com/meal/themeal/ThemealApplication.java`.
2.  Click the **"Run"** button appearing above the `main` method (or press F5).

## Usage

Once running, open your browser to:
**http://localhost:8080**

## Features

*   **Search**: Find recipes by name.
*   **Categories**: Browse by meal category.
*   **Random Meal**: Get a random recipe suggestion.
*   **Caching**: Repetitive queries are cached for performance.

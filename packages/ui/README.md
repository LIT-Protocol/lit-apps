# What

There's no set rules of how we should organise & structure the components & stylesheets. These are just my ideas and what works for me atm., open to any suggestions and I just want this UI repo get filled with all internal project components.

# UI Repo Folder Structure

We can categorise these UI components into

- domain/project-specific
- pure & unstyled (1 base class)
- mixed & styled (mixed class, a bit less modular but sometimes you just want styled components to be used)

# CSS

- `base.css`: all CSS files must(well if you want) extend from this
    - `utils.css`: like tailwind.css, but striped down to most common usages (for me). Included in `base.css` eg.

    ```
    // className="ml-12"
    margin-left: 12px;

    // className="flex center-item justify-center" to center an item in a div
    display: flex;
    align-items: center
    justify-content: center;

    ```

- `theme.example.css`: extends from `base.css`
    all styles then must include a theme prefix that will be added to the root div 

    eg. 

    ```
    // app.tsx
    <div className="app" data-lit-theme="purple"></div>

    // thene.purple.css
    [data-lit-theme="purple"] button {
        // big and round ;)
    }

    ```
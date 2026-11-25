// Async boundary: lets Module Federation negotiate shared singletons
// (react, react-router, @mfe/auth...) before any of them is evaluated.
import('./bootstrap');

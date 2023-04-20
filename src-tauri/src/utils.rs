#[cfg(debug_assertions)]
#[macro_export]
macro_rules! debug {
    ($($args:tt)*) => {{
        println!("[DEVELOPMENT ONLY] {}", format_args!($($args)*));
    }};
}

#[cfg(not(debug_assertions))]
#[macro_export]
macro_rules! debug {
    ($($args:tt)*) => {{}};
}

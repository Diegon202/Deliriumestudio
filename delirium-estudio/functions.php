<?php
/**
 * Delirium Estudio functions and definitions
 *
 * @package Delirium_Estudio
 */

if ( ! function_exists( 'delirium_estudio_setup' ) ) :
    /**
     * Sets up theme defaults and registers support for various WordPress features.
     */
    function delirium_estudio_setup() {
        // Enqueue editor styles.
        add_theme_support( 'editor-styles' );
        add_editor_style( 'style.css' );

        // Enable responsive embeds.
        add_theme_support( 'responsive-embeds' );
    }
endif;
add_action( 'after_setup_theme', 'delirium_estudio_setup' );

/**
 * Enqueue scripts and styles.
 */
function delirium_estudio_scripts() {
    // Enqueue theme stylesheet.
    wp_enqueue_style( 'delirium-estudio-style', get_template_directory_uri() . '/style.css', array(), '1.0.0' );
}
add_action( 'wp_enqueue_scripts', 'delirium_estudio_scripts' );

/**
 * Add favicon, app icon and logo metadata for search engines.
 */
function delirium_estudio_head_branding() {
    $theme_uri       = get_template_directory_uri();
    $favicon_url     = esc_url( $theme_uri . '/assets/favicon.png' );
    $apple_icon_url  = esc_url( $theme_uri . '/assets/apple-touch-icon.png' );
    $manifest_url    = esc_url( $theme_uri . '/assets/site.webmanifest' );
    $site_url        = esc_url( home_url( '/' ) );
    ?>
    <link rel="icon" type="image/png" sizes="96x96" href="<?php echo $favicon_url; ?>">
    <link rel="apple-touch-icon" sizes="180x180" href="<?php echo $apple_icon_url; ?>">
    <link rel="manifest" href="<?php echo $manifest_url; ?>">
    <script type="application/ld+json">
    <?php
    echo wp_json_encode(
        array(
            '@context' => 'https://schema.org',
            '@type'    => 'LocalBusiness',
            'name'     => get_bloginfo( 'name' ),
            'url'      => $site_url,
            'logo'     => $favicon_url,
            'image'    => $favicon_url,
        ),
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    );
    ?>
    </script>
    <?php
}
add_action( 'wp_head', 'delirium_estudio_head_branding', 1 );

/**
 * Register Custom Post Type: Pinturas (Paintings)
 */
function delirium_estudio_register_cpt_pintura() {
    $labels = array(
        'name'                  => _x( 'Pinturas', 'Post Type General Name', 'delirium-estudio' ),
        'singular_name'         => _x( 'Pintura', 'Post Type Singular Name', 'delirium-estudio' ),
        'menu_name'             => __( 'Pinturas en Venta', 'delirium-estudio' ),
        'name_admin_bar'        => __( 'Pintura', 'delirium-estudio' ),
        'archives'              => __( 'Archivo de Pinturas', 'delirium-estudio' ),
        'attributes'            => __( 'Atributos de Pintura', 'delirium-estudio' ),
        'parent_item_colon'     => __( 'Pintura Padre:', 'delirium-estudio' ),
        'all_items'             => __( 'Todas las Pinturas', 'delirium-estudio' ),
        'add_new_item'          => __( 'Añadir Nueva Pintura', 'delirium-estudio' ),
        'add_new'               => __( 'Añadir Nueva', 'delirium-estudio' ),
        'new_item'              => __( 'Nueva Pintura', 'delirium-estudio' ),
        'edit_item'             => __( 'Editar Pintura', 'delirium-estudio' ),
        'update_item'           => __( 'Actualizar Pintura', 'delirium-estudio' ),
        'view_item'             => __( 'Ver Pintura', 'delirium-estudio' ),
        'view_items'            => __( 'Ver Pinturas', 'delirium-estudio' ),
        'search_items'          => __( 'Buscar Pintura', 'delirium-estudio' ),
        'not_found'             => __( 'No se encontraron pinturas', 'delirium-estudio' ),
        'not_found_in_trash'    => __( 'No se encontraron pinturas en la papelera', 'delirium-estudio' ),
        'featured_image'        => __( 'Imagen de la Pintura', 'delirium-estudio' ),
        'set_featured_image'    => __( 'Establecer imagen de la pintura', 'delirium-estudio' ),
        'remove_featured_image' => __( 'Eliminar imagen de la pintura', 'delirium-estudio' ),
        'use_featured_image'    => __( 'Usar como imagen de la pintura', 'delirium-estudio' ),
        'insert_into_item'      => __( 'Insertar en la pintura', 'delirium-estudio' ),
        'uploaded_to_this_item' => __( 'Subido a esta pintura', 'delirium-estudio' ),
        'items_list'            => __( 'Lista de pinturas', 'delirium-estudio' ),
        'items_list_navigation' => __( 'Navegación de lista de pinturas', 'delirium-estudio' ),
        'filter_items_list'     => __( 'Filtrar lista de pinturas', 'delirium-estudio' ),
    );
    
    $args = array(
        'label'                 => __( 'Pintura', 'delirium-estudio' ),
        'description'           => __( 'Catálogo de pinturas de arte para la venta', 'delirium-estudio' ),
        'labels'                => $labels,
        'supports'              => array( 'title', 'editor', 'thumbnail', 'custom-fields', 'excerpt' ),
        'taxonomies'            => array(),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 5,
        'menu_icon'             => 'dashicons-art',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'show_in_rest'          => true, // Required for Gutenberg!
        'capability_type'       => 'post',
    );
    register_post_type( 'pintura', $args );
}
add_action( 'init', 'delirium_estudio_register_cpt_pintura', 0 );

/**
 * Register Custom Meta Fields for CPT: Pinturas (Medidas, Precio)
 */
function delirium_estudio_register_meta() {
    register_post_meta( 'pintura', 'medidas_pintura', array(
        'show_in_rest' => true,
        'single'       => true,
        'type'         => 'string',
        'auth_callback' => function() {
            return current_user_can( 'edit_posts' );
        }
    ) );

    register_post_meta( 'pintura', 'precio_pintura', array(
        'show_in_rest' => true,
        'single'       => true,
        'type'         => 'string',
        'auth_callback' => function() {
            return current_user_can( 'edit_posts' );
        }
    ) );
}
add_action( 'init', 'delirium_estudio_register_meta' );

/**
 * Shortcode to display painting properties (Medidas & Precio) in templates.
 * Usage: [detalles_pintura]
 */
function delirium_estudio_detalles_pintura_shortcode() {
    global $post;
    if ( ! $post || 'pintura' !== $post->post_type ) {
        return '';
    }
    
    $medidas = get_post_meta( $post->ID, 'medidas_pintura', true );
    $precio = get_post_meta( $post->ID, 'precio_pintura', true );
    
    $output = '<div class="detalles-pintura-container glow-card" style="padding: 1.5rem; margin-top: 1.5rem;">';
    if ( ! empty( $medidas ) ) {
        $output .= '<p style="margin: 0 0 0.5rem 0;"><strong>📐 Medidas:</strong> <span style="color: var(--wp--preset--color--tertiary);">' . esc_html( $medidas ) . '</span></p>';
    }
    if ( ! empty( $precio ) ) {
        $output .= '<p style="margin: 0 0 1rem 0;"><strong>💰 Precio:</strong> <span style="color: var(--wp--preset--color--primary); font-weight: bold; font-size: 1.2rem;">' . esc_html( $precio ) . '</span></p>';
    }
    $output .= '<a href="https://wa.me/YOUR_PHONE_NUMBER?text=' . rawurlencode( 'Hola, estoy interesado en la pintura "' . get_the_title() . '"' ) . '" class="wp-element-button" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-align: center;">💬 Consultar por WhatsApp</a>';
    $output .= '</div>';
    
    return $output;
}
add_shortcode( 'detalles_pintura', 'delirium_estudio_detalles_pintura_shortcode' );

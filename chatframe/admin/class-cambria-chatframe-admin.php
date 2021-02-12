<?php

/**
 * The admin-specific functionality of the plugin.
 * 
 *
 * @link       cambriasolutions.com
 * @since      1.1.0
 *
 * @package    Cambria_Chatframe
 * @subpackage Cambria_Chatframe/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Cambria_Chatframe
 * @subpackage Cambria_Chatframe/admin
 * @author     Cambria Solutions <marketing@cambriasolutions.com>
 */
class Cambria_Chatframe_Admin {
	function cambria_chatframe_menu() {

		return add_submenu_page( 'options-general.php', 'Gen',  'Gen', 'manage_options', 'cambria-webchat-admin', array($this, 'cambria_chatframe_options') );

    }
	
  
	/**
	 * The ID of this plugin.
	 *
	 * @since    1.1.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.1.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.1.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

    function cambria_chatframe_options() {
			echo '<div class="wrap">';
			echo '<h2>Gen Settings</h2>';
			echo '<p>To be discovered.</p>';
			echo '</div>';
    }

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.1.0
	 */
	public function enqueue_styles() {

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/cambria-chatframe-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.1.0
	 */
	public function enqueue_scripts() {

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/cambria-chatframe-admin.js', array( 'jquery' ), $this->version, false );

	}

}

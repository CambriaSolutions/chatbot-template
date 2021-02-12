<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       cambriasolutions.com
 * @since      1.1.0
 *
 * @package    Cambria_Chatframe
 * @subpackage Cambria_Chatframe/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Cambria_Chatframe
 * @subpackage Cambria_Chatframe/public
 * @author     Cambria Solutions <marketing@cambriasolutions.com>
 */
class Cambria_Chatframe_Public {

	/**
	 * @since    1.1.0
	 * @access   private
	 * @var      string    $plugin_name   cambria-chatframe
	 */
	private $plugin_name;

	/**
	 *
	 * @since    1.1.0
	 * @access   private
	 * @var      string    $version   1.1.0
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.1.0
	 * @param      string    $plugin_name    
	 * @param      string    $version    
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/** 
	 * Register the div with id "root"
	 * to be populated by our chat window
	 */

	public function display() {
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/partials/cambria-chatframe-public-display.php';
	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.1.0
	 */
	public function enqueue_scripts() {

	/** 
	 * Comment the code above and uncomment the code below 
	 * to have the chatframe load on every page
	 */

	$JSfiles = scandir(dirname(__FILE__) . '/app/build/static/js/');
		   $react_js_to_load = '';
		   foreach($JSfiles as $filename) {
			   if(strpos($filename,'.js')) {
				   $react_js_to_load = plugin_dir_url( __FILE__ ) . 'app/build/static/js/' . $filename;
				   wp_enqueue_script($filename, $react_js_to_load, array(), $this->version, true);
			   }
		   }
	}
}

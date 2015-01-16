/*
Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/*
 * This file is used/requested by the 'Styles' button.
 * The 'Styles' button is not enabled by default in DrupalFull and DrupalFiltered toolbars.
 */
if(typeof(CKEDITOR) !== 'undefined') {
    CKEDITOR.addStylesSet( 'drupal',
    [

            {
                    name : 'Align Left',
                    element : 'p',
                    attributes : { 'style' : 'text-align: left;' }
            },
            {
                    name : 'Center',
                    element : 'p',
                    attributes : { 'style' : 'text-align: center;' }
            },
            {
                    name : 'Align Right',
                    element : 'p',
                    attributes : { 'style' : 'text-align: right;' }
            },

            { name : 'Big'				, element : 'span', attributes : { 'style' : 'font-size: larger;' } },
            { name : 'Small'			, element : 'span', attributes : { 'style' : 'font-size: smaller;' } },

			{ name : 'Button'				, element : 'a', attributes : { 'class' : 'button' } },
			{ name : 'Image Left'			, element : 'img', attributes : { 'class' : 'image-left' } },
			{ name : 'Image Center'			, element : 'img', attributes : { 'class' : 'image-center' } },
			{ name : 'Image Right'			, element : 'img', attributes : { 'class' : 'image-right' } }
    ]);
}

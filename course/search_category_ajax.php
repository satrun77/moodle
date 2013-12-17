<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * This file processes AJAX course category search for selecting a category
 *
 * @package    course
 * @copyright  2013 Mohamed Alsharaf <m.alsharaf@massey.ac.nz>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define('AJAX_SCRIPT', true);

require(__DIR__ . '/../config.php');
require_once($CFG->libdir. '/coursecatlib.php');

$keyword = optional_param('keyword', '', PARAM_NOTAGS);

$PAGE->set_url(new moodle_url('/course/search_category_ajax.php', array('keyword' => $keyword)));

// Access check.
require_login();

// Get list of all categories
$displaylist = coursecat::make_categories_list('moodle/course:create');

// Filter category list by the search query
$outcome = array_filter($displaylist, function($category) use ($keyword) {
    return (stripos($category, $keyword) !== false);
});

// JSON Output.
echo json_encode($outcome);

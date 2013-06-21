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
 * This file processes AJAX course search for selecting sub-courses in the meta enrolments plugin
 *
 * @package    enrol_meta
 * @copyright  2013 Mohamed Alsharaf <m.alsharaf@massey.ac.nz>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define('AJAX_SCRIPT', true);

require(__DIR__ . '/../../config.php');
require('locallib.php');

$keyword = optional_param('keyword', '', PARAM_NOTAGS);
$id = required_param('courseid', PARAM_INT);
if ($id == SITEID) {
    throw new moodle_exception('invalidcourse');
}

$PAGE->set_url(new moodle_url('/enrol/meta/search_ajax.php', array('keyword' => $keyword, 'courseid' => $id)));

// Course details.
$course = $DB->get_record('course', array('id'=>$id), '*', MUST_EXIST);
$context = context_course::instance($course->id, MUST_EXIST);

// Access check.
require_login($course);
require_capability('moodle/course:enrolconfig', $context);

// Search for potential link courses.
$outcome = enrol_meta_search($keyword, $course);

// JSON Output.
echo json_encode($outcome);

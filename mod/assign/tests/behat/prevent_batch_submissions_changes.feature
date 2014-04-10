@mod @mod_assign
Feature: Prevent or allow assignment submissions changes (batch action)
  In order to control when students can change their submissions
  As a teacher
  I need to prevent or allow students submissions at any time

  @javascript @_alert
  Scenario: Preventing changes and allowing them again
    Given the following "courses" exist:
      | fullname | shortname | category | groupmode |
      | Course 1 | C1 | 0 | 1 |
    And the following "users" exist:
      | username | firstname | lastname | email |
      | teacher1 | Teacher | 1 | teacher1@asd.com |
      | student1 | Student | 1 | student1@asd.com |
      | student2 | Student | 2 | student2@asd.com |
    And the following "course enrolments" exist:
      | user | course | role |
      | teacher1 | C1 | editingteacher |
      | student1 | C1 | student |
      | student2 | C1 | student |
 Given the following "activities" exist:
   | activity | course | idnumber | name                 | intro                       | assignsubmission_onlinetext_enabled | assignsubmission_file_enabled
   | assign   | C1     | assign1  | Test assignment name | Test assignment description | 1								     | 0
    And I log in as "student1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I press "Add submission"
    And I set the following fields to these values:
      | Online text | I'm the student submission |
    And I press "Save changes"
    And I press "Edit submission"
    And I set the following fields to these values:
      | Online text | I'm the student submission and he/she edited me |
    And I press "Save changes"
    And I log out
    And I log in as "student2"
    And I follow "Course 1"
    And I follow "Test assignment name"
    And I press "Add submission"
    And I set the following fields to these values:
      | Online text | I'm the student2 submission |
    And I press "Save changes"
    And I press "Edit submission"
    And I set the following fields to these values:
      | Online text | I'm the student2 submission and he/she edited me |
    And I press "Save changes"
    And I log out
    And I log in as "teacher1"
    And I follow "Course 1"
    And I follow "Test assignment name"
    When I follow "View/grade all submissions"
    And I check "selectall"
    And I press "Go", confirming the dialog
    And I wait to be redirected
    Then I should see "Submission changes not allowed" in the "Student 1" "table_row"
    And I should see "Submission changes not allowed" in the "Student 2" "table_row"
    And I check "selectall"
    When I select "Unlock submissions" from "id_operation"
    And I press "Go", confirming the dialog
    And I wait to be redirected
    Then I should not see "Submission changes not allowed" in the "Student 1" "table_row"
    And I should not see "Submission changes not allowed" in the "Student 2" "table_row"

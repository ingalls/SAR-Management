DROP TABLE IF EXISTS knex_migrations;
DROP TABLE IF EXISTS knex_migrations_lock;

DROP VIEW IF EXISTS view_application_comments;
DROP VIEW IF EXISTS view_issues;
DROP VIEW IF EXISTS view_issues_comments;
DROP VIEW IF EXISTS view_mission;
DROP VIEW IF EXISTS view_training;
DROP VIEW IF EXISTS view_equipment;
DROP VIEW IF EXISTS view_issues_assigned;
DROP VIEW IF EXISTS view_locations;
DROP VIEW IF EXISTS view_teams;
DROP VIEW IF EXISTS leaders_view;

ALTER TABLE certs_known
    ALTER COLUMN name DROP DEFAULT;
ALTER TABLE users_reset
    ALTER COLUMN uid SET NOT NULL;
ALTER TABLE notifications
    ALTER COLUMN uid SET NOT NULL;
ALTER TABLE leadership
    ALTER COLUMN uid SET NOT NULL;
ALTER TABLE user_settings
    ALTER COLUMN value SET DATA TYPE JSON;
ALTER TABLE equipment_types
    ALTER COLUMN schema SET DATA TYPE JSON;
ALTER TABLE equipment
    ALTER COLUMN meta SET DATA TYPE JSON;
ALTER TABLE certs_known
    ALTER COLUMN created SET DATA TYPE TIMESTAMPTZ;
ALTER TABLE certs_known
    ALTER COLUMN updated SET DATA TYPE TIMESTAMPTZ;
ALTER TABLE users
    ALTER COLUMN emergency SET DATA TYPE JSON;
ALTER TABLE server
    ALTER COLUMN value SET DATA TYPE JSON;
ALTER TABLE teams
    ALTER COLUMN iam SET DATA TYPE JSON;
ALTER TABLE users_to_teams
    ALTER COLUMN tid SET DATA TYPE INTEGER;
ALTER TABLE schedules_event
    ALTER COLUMN schedule_id SET DATA TYPE INTEGER;
ALTER TABLE schedules_assigned
    ALTER COLUMN schedule_id SET DATA TYPE INTEGER;
ALTER TABLE poll_votes
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE missions_assigned
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE issues_assigned
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE application_comments
    ALTER COLUMN application SET DATA TYPE INTEGER;
ALTER TABLE applications
    ALTER COLUMN meta SET DATA TYPE JSON;
ALTER TABLE trainings_team
    ALTER COLUMN team_id SET DATA TYPE INTEGER;
ALTER TABLE trainings_team
    ALTER COLUMN training_id SET DATA TYPE INTEGER;
ALTER TABLE training_assigned
    ALTER COLUMN training_id SET DATA TYPE INTEGER;
ALTER TABLE poll_votes
    ALTER COLUMN question_id SET DATA TYPE INTEGER;
ALTER TABLE poll_votes
    ALTER COLUMN poll_id SET DATA TYPE INTEGER;
ALTER TABLE poll_questions
    ALTER COLUMN poll_id SET DATA TYPE INTEGER;
ALTER TABLE missions_team
    ALTER COLUMN team_id SET DATA TYPE INTEGER;
ALTER TABLE missions_team
    ALTER COLUMN mission_id SET DATA TYPE INTEGER;
ALTER TABLE missions_assigned
    ALTER COLUMN mission_id SET DATA TYPE INTEGER;
ALTER TABLE issues_comments
    ALTER COLUMN issue SET DATA TYPE INTEGER;
ALTER TABLE issues_assigned
    ALTER COLUMN issue_id SET DATA TYPE INTEGER;
ALTER TABLE issues
    ALTER COLUMN poll_id SET DATA TYPE INTEGER;
ALTER TABLE fieldability
    ALTER COLUMN team SET DATA TYPE INTEGER;
ALTER TABLE equipment_assigned
    ALTER COLUMN equip_id SET DATA TYPE INTEGER;
ALTER TABLE equipment
    ALTER COLUMN type_id SET DATA TYPE INTEGER;
ALTER TABLE equipment
    ALTER COLUMN parent SET DATA TYPE INTEGER;
ALTER TABLE certs
    ALTER COLUMN known SET DATA TYPE INTEGER;
ALTER TABLE certs
    ALTER COLUMN asset SET DATA TYPE INTEGER;
ALTER TABLE poll_questions
    ALTER COLUMN question SET DATA TYPE JSON;
ALTER TABLE user_settings
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE users_reset
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE users_to_teams
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE certs
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE equipment_assigned
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE issues_assigned
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE leadership
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE missions_assigned
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE notifications
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE schedules_assigned
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE schedules_event
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE training_assigned
    ALTER COLUMN uid SET DATA TYPE INTEGER;
ALTER TABLE application_comments
    ALTER COLUMN author SET DATA TYPE INTEGER;
ALTER TABLE issues
    ALTER COLUMN author SET DATA TYPE INTEGER;
ALTER TABLE issues_comments
    ALTER COLUMN author SET DATA TYPE INTEGER;
ALTER TABLE missions
    ALTER COLUMN author SET DATA TYPE INTEGER;
ALTER TABLE training
    ALTER COLUMN author SET DATA TYPE INTEGER;

ALTER TABLE users
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE user_settings
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE teams
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE applications
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE application_comments
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE assets
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE certs_known
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE certs
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE equipment
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE equipment_assigned
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE equipment_types
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE fieldability
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE poll
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE issues
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE issues_comments
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE leadership
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE mission_role
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE missions
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE missions_team
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE notifications
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE poll_questions
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE schedule
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE schedules_assigned
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE schedules_event
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE training
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE training_assigned
    ALTER COLUMN id SET DATA TYPE INTEGER;
ALTER TABLE trainings_team
    ALTER COLUMN id SET DATA TYPE INTEGER;

ALTER DATABASE postgres REFRESH COLLATION VERSION;

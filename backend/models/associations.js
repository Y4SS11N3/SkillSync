const User = require('./User');
const Skill = require('./Skill');
const Exchange = require('./Exchange');
const Reputation = require('./Reputation');
const Achievement = require('./Achievement');
const Review = require('./Review')
const LearningGoal = require('./LearningGoal');
const GlobalSkillDemand = require('./GlobalSkillDemand');
const SkillQuest = require('./SkillQuest');
const TimeCredit = require('./TimeCredit');
const Notification = require('./Notification');
const Chat = require('./Chat');
const Message = require('./Message');
const LiveSession = require('./LiveSession');
const UserSkill = require('./UserSkill');

const setupAssociations = () => {
  // User associations
  User.hasMany(Skill, { foreignKey: 'userId', as: 'Skills' });
  User.belongsToMany(Skill, { through: UserSkill, foreignKey: 'userId', as: 'InterestedSkills' });
  User.hasMany(Exchange, { as: 'user1Exchanges', foreignKey: 'user1Id' });
  User.hasMany(Exchange, { as: 'user2Exchanges', foreignKey: 'user2Id' });
  User.hasOne(Reputation, { foreignKey: 'userId' });
  User.hasMany(Achievement, { foreignKey: 'userId' });
  User.hasMany(LearningGoal, { foreignKey: 'userId' });
  User.hasMany(Review, { as: 'reviewsGiven', foreignKey: 'reviewerId' });
  User.hasMany(Review, { as: 'reviewsReceived', foreignKey: 'reviewedUserId' });

  // Skill associations
  Skill.belongsTo(User, { foreignKey: 'userId' });
  Skill.belongsToMany(User, { through: UserSkill, foreignKey: 'skillId', as: 'InterestedUsers' });
  Skill.hasMany(Exchange, { as: 'skill1Exchanges', foreignKey: 'skill1Id' });
  Skill.hasMany(Exchange, { as: 'skill2Exchanges', foreignKey: 'skill2Id' });
  Skill.hasMany(LearningGoal, { foreignKey: 'skillId' });
  Skill.hasMany(GlobalSkillDemand, { foreignKey: 'skillId' });

  // Exchange associations
  Exchange.belongsTo(User, { as: 'user1', foreignKey: 'user1Id' });
  Exchange.belongsTo(User, { as: 'user2', foreignKey: 'user2Id' });
  Exchange.belongsTo(Skill, { as: 'skill1', foreignKey: 'skill1Id' });
  Exchange.belongsTo(Skill, { as: 'skill2', foreignKey: 'skill2Id' });
  Exchange.hasMany(Review, { foreignKey: 'exchangeId' });

  // SkillQuest associations
  SkillQuest.belongsTo(User, { foreignKey: 'userId' });
  SkillQuest.belongsTo(Skill, { foreignKey: 'skillId' });
  User.hasMany(SkillQuest, { foreignKey: 'userId' });
  Skill.hasMany(SkillQuest, { foreignKey: 'skillId' });

  // UserSkill associations
  User.belongsToMany(Skill, { through: UserSkill, foreignKey: 'userId' });
  Skill.belongsToMany(User, { through: UserSkill, foreignKey: 'skillId' });
  UserSkill.belongsTo(User, { foreignKey: 'userId' });
  UserSkill.belongsTo(Skill, { foreignKey: 'skillId' });

  // Reputation associations
  Reputation.belongsTo(User, { foreignKey: 'userId' });

  // Achievement associations
  Achievement.belongsTo(User, { foreignKey: 'userId' });

  // TimeCredit associations
  User.hasOne(TimeCredit, { foreignKey: 'userId' });
  TimeCredit.belongsTo(User, { foreignKey: 'userId' });

  // LearningGoal associations
  LearningGoal.belongsTo(User, { foreignKey: 'userId' });
  LearningGoal.belongsTo(Skill, { foreignKey: 'skillId' });

  // Notification associations
  User.hasMany(Notification, { foreignKey: 'userId' });
  Notification.belongsTo(User, { foreignKey: 'userId' });
  Notification.belongsTo(Exchange, { foreignKey: 'exchangeId' });
  Exchange.hasMany(Notification, { foreignKey: 'exchangeId' });

  // Review associations
  Review.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewerId' });
  Review.belongsTo(User, { as: 'reviewedUser', foreignKey: 'reviewedUserId' });
  Review.belongsTo(Exchange, { foreignKey: 'exchangeId' });

  // Chat associations
  Chat.belongsTo(Exchange, { foreignKey: 'exchangeId' });
  Exchange.hasOne(Chat, { foreignKey: 'exchangeId' });
  Chat.hasMany(Message, { foreignKey: 'chatId' });

  // Message associations
  Message.belongsTo(Chat, { foreignKey: 'chatId' });
  Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
  User.hasMany(Message, { foreignKey: 'senderId' });
  Message.belongsTo(LiveSession, { foreignKey: 'liveSessionId' });

  // LiveSession associations
  LiveSession.belongsTo(Exchange, { foreignKey: 'exchangeId' });
  LiveSession.belongsTo(User, { as: 'initiator', foreignKey: 'initiatorId' });
  LiveSession.belongsTo(User, { as: 'provider', foreignKey: 'providerId' });
  LiveSession.hasOne(Message, { foreignKey: 'liveSessionId' });

  Exchange.hasMany(LiveSession, { foreignKey: 'exchangeId' });
  User.hasMany(LiveSession, { as: 'initiatedSessions', foreignKey: 'initiatorId' });
  User.hasMany(LiveSession, { as: 'providedSessions', foreignKey: 'providerId' });

  // New Notification associations for LiveSession
  Notification.belongsTo(LiveSession, { foreignKey: 'liveSessionId' });
  LiveSession.hasMany(Notification, { foreignKey: 'liveSessionId' });

  // GlobalSkillDemand associations
  GlobalSkillDemand.belongsTo(Skill, { foreignKey: 'skillId' });
};

module.exports = {
  User,
  Skill,
  Review,
  Exchange,
  Reputation,
  Notification,
  Achievement,
  LearningGoal,
  GlobalSkillDemand,
  SkillQuest,
  TimeCredit,
  Chat,
  Message,
  LiveSession,
  UserSkill,
  setupAssociations
};
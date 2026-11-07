package com.mindforge.app.data.local.db;

import androidx.annotation.NonNull;
import androidx.room.DatabaseConfiguration;
import androidx.room.InvalidationTracker;
import androidx.room.RoomDatabase;
import androidx.room.RoomOpenHelper;
import androidx.room.migration.AutoMigrationSpec;
import androidx.room.migration.Migration;
import androidx.room.util.DBUtil;
import androidx.room.util.TableInfo;
import androidx.sqlite.db.SupportSQLiteDatabase;
import androidx.sqlite.db.SupportSQLiteOpenHelper;
import com.mindforge.app.data.local.db.dao.AchievementDao;
import com.mindforge.app.data.local.db.dao.AchievementDao_Impl;
import com.mindforge.app.data.local.db.dao.DailyActivityDao;
import com.mindforge.app.data.local.db.dao.DailyActivityDao_Impl;
import com.mindforge.app.data.local.db.dao.GameStatDao;
import com.mindforge.app.data.local.db.dao.GameStatDao_Impl;
import com.mindforge.app.data.local.db.dao.SessionDao;
import com.mindforge.app.data.local.db.dao.SessionDao_Impl;
import com.mindforge.app.data.local.db.dao.StreakDao;
import com.mindforge.app.data.local.db.dao.StreakDao_Impl;
import java.lang.Class;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Generated;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class MindForgeDatabase_Impl extends MindForgeDatabase {
  private volatile SessionDao _sessionDao;

  private volatile GameStatDao _gameStatDao;

  private volatile DailyActivityDao _dailyActivityDao;

  private volatile StreakDao _streakDao;

  private volatile AchievementDao _achievementDao;

  @Override
  @NonNull
  protected SupportSQLiteOpenHelper createOpenHelper(@NonNull final DatabaseConfiguration config) {
    final SupportSQLiteOpenHelper.Callback _openCallback = new RoomOpenHelper(config, new RoomOpenHelper.Delegate(1) {
      @Override
      public void createAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS `sessions` (`id` TEXT NOT NULL, `gameId` TEXT NOT NULL, `category` TEXT NOT NULL, `level` INTEGER NOT NULL, `score` INTEGER NOT NULL, `accuracy` REAL NOT NULL, `speedSeconds` REAL NOT NULL, `stars` INTEGER NOT NULL, `xpEarned` INTEGER NOT NULL, `mistakes` INTEGER NOT NULL, `timestamp` INTEGER NOT NULL, `localDate` TEXT NOT NULL, PRIMARY KEY(`id`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS `game_stats` (`gameId` TEXT NOT NULL, `highestLevelUnlocked` INTEGER NOT NULL, `totalPlays` INTEGER NOT NULL, `bestScore` INTEGER NOT NULL, `bestAccuracy` REAL NOT NULL, `fastestSpeed` REAL NOT NULL, `totalStars` INTEGER NOT NULL, PRIMARY KEY(`gameId`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS `daily_activities` (`dateString` TEXT NOT NULL, `sessionsCount` INTEGER NOT NULL, `totalXp` INTEGER NOT NULL, `dailyChallengeCompleted` INTEGER NOT NULL, PRIMARY KEY(`dateString`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS `streak_record` (`id` INTEGER NOT NULL, `currentStreak` INTEGER NOT NULL, `longestStreak` INTEGER NOT NULL, `lastActiveDate` TEXT NOT NULL, `freezesAvailable` INTEGER NOT NULL, `lastMonotonicElapsed` INTEGER NOT NULL, `lastRealtimeMillis` INTEGER NOT NULL, PRIMARY KEY(`id`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS `achievements` (`id` TEXT NOT NULL, `progress` INTEGER NOT NULL, `maxProgress` INTEGER NOT NULL, `isUnlocked` INTEGER NOT NULL, `unlockedAt` INTEGER, PRIMARY KEY(`id`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)");
        db.execSQL("INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, 'f4ff3e61091e5254c746eaa0e1594031')");
      }

      @Override
      public void dropAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("DROP TABLE IF EXISTS `sessions`");
        db.execSQL("DROP TABLE IF EXISTS `game_stats`");
        db.execSQL("DROP TABLE IF EXISTS `daily_activities`");
        db.execSQL("DROP TABLE IF EXISTS `streak_record`");
        db.execSQL("DROP TABLE IF EXISTS `achievements`");
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onDestructiveMigration(db);
          }
        }
      }

      @Override
      public void onCreate(@NonNull final SupportSQLiteDatabase db) {
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onCreate(db);
          }
        }
      }

      @Override
      public void onOpen(@NonNull final SupportSQLiteDatabase db) {
        mDatabase = db;
        internalInitInvalidationTracker(db);
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onOpen(db);
          }
        }
      }

      @Override
      public void onPreMigrate(@NonNull final SupportSQLiteDatabase db) {
        DBUtil.dropFtsSyncTriggers(db);
      }

      @Override
      public void onPostMigrate(@NonNull final SupportSQLiteDatabase db) {
      }

      @Override
      @NonNull
      public RoomOpenHelper.ValidationResult onValidateSchema(
          @NonNull final SupportSQLiteDatabase db) {
        final HashMap<String, TableInfo.Column> _columnsSessions = new HashMap<String, TableInfo.Column>(12);
        _columnsSessions.put("id", new TableInfo.Column("id", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("gameId", new TableInfo.Column("gameId", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("category", new TableInfo.Column("category", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("level", new TableInfo.Column("level", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("score", new TableInfo.Column("score", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("accuracy", new TableInfo.Column("accuracy", "REAL", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("speedSeconds", new TableInfo.Column("speedSeconds", "REAL", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("stars", new TableInfo.Column("stars", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("xpEarned", new TableInfo.Column("xpEarned", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("mistakes", new TableInfo.Column("mistakes", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("timestamp", new TableInfo.Column("timestamp", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsSessions.put("localDate", new TableInfo.Column("localDate", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysSessions = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesSessions = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoSessions = new TableInfo("sessions", _columnsSessions, _foreignKeysSessions, _indicesSessions);
        final TableInfo _existingSessions = TableInfo.read(db, "sessions");
        if (!_infoSessions.equals(_existingSessions)) {
          return new RoomOpenHelper.ValidationResult(false, "sessions(com.mindforge.app.data.local.db.entity.SessionEntity).\n"
                  + " Expected:\n" + _infoSessions + "\n"
                  + " Found:\n" + _existingSessions);
        }
        final HashMap<String, TableInfo.Column> _columnsGameStats = new HashMap<String, TableInfo.Column>(7);
        _columnsGameStats.put("gameId", new TableInfo.Column("gameId", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsGameStats.put("highestLevelUnlocked", new TableInfo.Column("highestLevelUnlocked", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsGameStats.put("totalPlays", new TableInfo.Column("totalPlays", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsGameStats.put("bestScore", new TableInfo.Column("bestScore", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsGameStats.put("bestAccuracy", new TableInfo.Column("bestAccuracy", "REAL", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsGameStats.put("fastestSpeed", new TableInfo.Column("fastestSpeed", "REAL", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsGameStats.put("totalStars", new TableInfo.Column("totalStars", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysGameStats = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesGameStats = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoGameStats = new TableInfo("game_stats", _columnsGameStats, _foreignKeysGameStats, _indicesGameStats);
        final TableInfo _existingGameStats = TableInfo.read(db, "game_stats");
        if (!_infoGameStats.equals(_existingGameStats)) {
          return new RoomOpenHelper.ValidationResult(false, "game_stats(com.mindforge.app.data.local.db.entity.GameStatEntity).\n"
                  + " Expected:\n" + _infoGameStats + "\n"
                  + " Found:\n" + _existingGameStats);
        }
        final HashMap<String, TableInfo.Column> _columnsDailyActivities = new HashMap<String, TableInfo.Column>(4);
        _columnsDailyActivities.put("dateString", new TableInfo.Column("dateString", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsDailyActivities.put("sessionsCount", new TableInfo.Column("sessionsCount", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsDailyActivities.put("totalXp", new TableInfo.Column("totalXp", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsDailyActivities.put("dailyChallengeCompleted", new TableInfo.Column("dailyChallengeCompleted", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysDailyActivities = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesDailyActivities = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoDailyActivities = new TableInfo("daily_activities", _columnsDailyActivities, _foreignKeysDailyActivities, _indicesDailyActivities);
        final TableInfo _existingDailyActivities = TableInfo.read(db, "daily_activities");
        if (!_infoDailyActivities.equals(_existingDailyActivities)) {
          return new RoomOpenHelper.ValidationResult(false, "daily_activities(com.mindforge.app.data.local.db.entity.DailyActivityEntity).\n"
                  + " Expected:\n" + _infoDailyActivities + "\n"
                  + " Found:\n" + _existingDailyActivities);
        }
        final HashMap<String, TableInfo.Column> _columnsStreakRecord = new HashMap<String, TableInfo.Column>(7);
        _columnsStreakRecord.put("id", new TableInfo.Column("id", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsStreakRecord.put("currentStreak", new TableInfo.Column("currentStreak", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsStreakRecord.put("longestStreak", new TableInfo.Column("longestStreak", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsStreakRecord.put("lastActiveDate", new TableInfo.Column("lastActiveDate", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsStreakRecord.put("freezesAvailable", new TableInfo.Column("freezesAvailable", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsStreakRecord.put("lastMonotonicElapsed", new TableInfo.Column("lastMonotonicElapsed", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsStreakRecord.put("lastRealtimeMillis", new TableInfo.Column("lastRealtimeMillis", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysStreakRecord = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesStreakRecord = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoStreakRecord = new TableInfo("streak_record", _columnsStreakRecord, _foreignKeysStreakRecord, _indicesStreakRecord);
        final TableInfo _existingStreakRecord = TableInfo.read(db, "streak_record");
        if (!_infoStreakRecord.equals(_existingStreakRecord)) {
          return new RoomOpenHelper.ValidationResult(false, "streak_record(com.mindforge.app.data.local.db.entity.StreakRecordEntity).\n"
                  + " Expected:\n" + _infoStreakRecord + "\n"
                  + " Found:\n" + _existingStreakRecord);
        }
        final HashMap<String, TableInfo.Column> _columnsAchievements = new HashMap<String, TableInfo.Column>(5);
        _columnsAchievements.put("id", new TableInfo.Column("id", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsAchievements.put("progress", new TableInfo.Column("progress", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsAchievements.put("maxProgress", new TableInfo.Column("maxProgress", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsAchievements.put("isUnlocked", new TableInfo.Column("isUnlocked", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsAchievements.put("unlockedAt", new TableInfo.Column("unlockedAt", "INTEGER", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysAchievements = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesAchievements = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoAchievements = new TableInfo("achievements", _columnsAchievements, _foreignKeysAchievements, _indicesAchievements);
        final TableInfo _existingAchievements = TableInfo.read(db, "achievements");
        if (!_infoAchievements.equals(_existingAchievements)) {
          return new RoomOpenHelper.ValidationResult(false, "achievements(com.mindforge.app.data.local.db.entity.AchievementEntity).\n"
                  + " Expected:\n" + _infoAchievements + "\n"
                  + " Found:\n" + _existingAchievements);
        }
        return new RoomOpenHelper.ValidationResult(true, null);
      }
    }, "f4ff3e61091e5254c746eaa0e1594031", "497f9764a95baaaeef0464b7cc3d6fa9");
    final SupportSQLiteOpenHelper.Configuration _sqliteConfig = SupportSQLiteOpenHelper.Configuration.builder(config.context).name(config.name).callback(_openCallback).build();
    final SupportSQLiteOpenHelper _helper = config.sqliteOpenHelperFactory.create(_sqliteConfig);
    return _helper;
  }

  @Override
  @NonNull
  protected InvalidationTracker createInvalidationTracker() {
    final HashMap<String, String> _shadowTablesMap = new HashMap<String, String>(0);
    final HashMap<String, Set<String>> _viewTables = new HashMap<String, Set<String>>(0);
    return new InvalidationTracker(this, _shadowTablesMap, _viewTables, "sessions","game_stats","daily_activities","streak_record","achievements");
  }

  @Override
  public void clearAllTables() {
    super.assertNotMainThread();
    final SupportSQLiteDatabase _db = super.getOpenHelper().getWritableDatabase();
    try {
      super.beginTransaction();
      _db.execSQL("DELETE FROM `sessions`");
      _db.execSQL("DELETE FROM `game_stats`");
      _db.execSQL("DELETE FROM `daily_activities`");
      _db.execSQL("DELETE FROM `streak_record`");
      _db.execSQL("DELETE FROM `achievements`");
      super.setTransactionSuccessful();
    } finally {
      super.endTransaction();
      _db.query("PRAGMA wal_checkpoint(FULL)").close();
      if (!_db.inTransaction()) {
        _db.execSQL("VACUUM");
      }
    }
  }

  @Override
  @NonNull
  protected Map<Class<?>, List<Class<?>>> getRequiredTypeConverters() {
    final HashMap<Class<?>, List<Class<?>>> _typeConvertersMap = new HashMap<Class<?>, List<Class<?>>>();
    _typeConvertersMap.put(SessionDao.class, SessionDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(GameStatDao.class, GameStatDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(DailyActivityDao.class, DailyActivityDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(StreakDao.class, StreakDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(AchievementDao.class, AchievementDao_Impl.getRequiredConverters());
    return _typeConvertersMap;
  }

  @Override
  @NonNull
  public Set<Class<? extends AutoMigrationSpec>> getRequiredAutoMigrationSpecs() {
    final HashSet<Class<? extends AutoMigrationSpec>> _autoMigrationSpecsSet = new HashSet<Class<? extends AutoMigrationSpec>>();
    return _autoMigrationSpecsSet;
  }

  @Override
  @NonNull
  public List<Migration> getAutoMigrations(
      @NonNull final Map<Class<? extends AutoMigrationSpec>, AutoMigrationSpec> autoMigrationSpecs) {
    final List<Migration> _autoMigrations = new ArrayList<Migration>();
    return _autoMigrations;
  }

  @Override
  public SessionDao sessionDao() {
    if (_sessionDao != null) {
      return _sessionDao;
    } else {
      synchronized(this) {
        if(_sessionDao == null) {
          _sessionDao = new SessionDao_Impl(this);
        }
        return _sessionDao;
      }
    }
  }

  @Override
  public GameStatDao gameStatDao() {
    if (_gameStatDao != null) {
      return _gameStatDao;
    } else {
      synchronized(this) {
        if(_gameStatDao == null) {
          _gameStatDao = new GameStatDao_Impl(this);
        }
        return _gameStatDao;
      }
    }
  }

  @Override
  public DailyActivityDao dailyActivityDao() {
    if (_dailyActivityDao != null) {
      return _dailyActivityDao;
    } else {
      synchronized(this) {
        if(_dailyActivityDao == null) {
          _dailyActivityDao = new DailyActivityDao_Impl(this);
        }
        return _dailyActivityDao;
      }
    }
  }

  @Override
  public StreakDao streakDao() {
    if (_streakDao != null) {
      return _streakDao;
    } else {
      synchronized(this) {
        if(_streakDao == null) {
          _streakDao = new StreakDao_Impl(this);
        }
        return _streakDao;
      }
    }
  }

  @Override
  public AchievementDao achievementDao() {
    if (_achievementDao != null) {
      return _achievementDao;
    } else {
      synchronized(this) {
        if(_achievementDao == null) {
          _achievementDao = new AchievementDao_Impl(this);
        }
        return _achievementDao;
      }
    }
  }
}

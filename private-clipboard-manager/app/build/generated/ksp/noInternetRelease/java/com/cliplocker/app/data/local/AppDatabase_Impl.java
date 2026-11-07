package com.cliplocker.app.data.local;

import androidx.annotation.NonNull;
import androidx.room.DatabaseConfiguration;
import androidx.room.InvalidationTracker;
import androidx.room.RoomDatabase;
import androidx.room.RoomOpenHelper;
import androidx.room.migration.AutoMigrationSpec;
import androidx.room.migration.Migration;
import androidx.room.util.DBUtil;
import androidx.room.util.FtsTableInfo;
import androidx.room.util.TableInfo;
import androidx.sqlite.db.SupportSQLiteDatabase;
import androidx.sqlite.db.SupportSQLiteOpenHelper;
import java.lang.Class;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Generated;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class AppDatabase_Impl extends AppDatabase {
  private volatile ClipDao _clipDao;

  private volatile IgnoreAppDao _ignoreAppDao;

  @Override
  @NonNull
  protected SupportSQLiteOpenHelper createOpenHelper(@NonNull final DatabaseConfiguration config) {
    final SupportSQLiteOpenHelper.Callback _openCallback = new RoomOpenHelper(config, new RoomOpenHelper.Delegate(1) {
      @Override
      public void createAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS `clips` (`rowid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `content` TEXT NOT NULL, `type` TEXT NOT NULL, `timestamp` INTEGER NOT NULL, `source_app_package` TEXT, `source_app_label` TEXT, `is_pinned` INTEGER NOT NULL, `is_secret` INTEGER NOT NULL, `sensitive_type` TEXT NOT NULL, `secret_expires_at` INTEGER, `image_uri` TEXT, `thumbnail_uri` TEXT, `contentHash` TEXT NOT NULL, `char_count` INTEGER NOT NULL, `word_count` INTEGER NOT NULL)");
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_clips_contentHash` ON `clips` (`contentHash`)");
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_clips_timestamp` ON `clips` (`timestamp`)");
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_clips_is_pinned` ON `clips` (`is_pinned`)");
        db.execSQL("CREATE INDEX IF NOT EXISTS `index_clips_is_secret` ON `clips` (`is_secret`)");
        db.execSQL("CREATE VIRTUAL TABLE IF NOT EXISTS `clips_fts` USING FTS4(`content` TEXT NOT NULL, content=`clips`)");
        db.execSQL("CREATE TRIGGER IF NOT EXISTS room_fts_content_sync_clips_fts_BEFORE_UPDATE BEFORE UPDATE ON `clips` BEGIN DELETE FROM `clips_fts` WHERE `docid`=OLD.`rowid`; END");
        db.execSQL("CREATE TRIGGER IF NOT EXISTS room_fts_content_sync_clips_fts_BEFORE_DELETE BEFORE DELETE ON `clips` BEGIN DELETE FROM `clips_fts` WHERE `docid`=OLD.`rowid`; END");
        db.execSQL("CREATE TRIGGER IF NOT EXISTS room_fts_content_sync_clips_fts_AFTER_UPDATE AFTER UPDATE ON `clips` BEGIN INSERT INTO `clips_fts`(`docid`, `content`) VALUES (NEW.`rowid`, NEW.`content`); END");
        db.execSQL("CREATE TRIGGER IF NOT EXISTS room_fts_content_sync_clips_fts_AFTER_INSERT AFTER INSERT ON `clips` BEGIN INSERT INTO `clips_fts`(`docid`, `content`) VALUES (NEW.`rowid`, NEW.`content`); END");
        db.execSQL("CREATE TABLE IF NOT EXISTS `ignored_apps` (`package_name` TEXT NOT NULL, `app_label` TEXT NOT NULL, `date_added` INTEGER NOT NULL, PRIMARY KEY(`package_name`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)");
        db.execSQL("INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, '72d4eec598cea1bb547c181c9fed1738')");
      }

      @Override
      public void dropAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("DROP TABLE IF EXISTS `clips`");
        db.execSQL("DROP TABLE IF EXISTS `clips_fts`");
        db.execSQL("DROP TABLE IF EXISTS `ignored_apps`");
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
        db.execSQL("CREATE TRIGGER IF NOT EXISTS room_fts_content_sync_clips_fts_BEFORE_UPDATE BEFORE UPDATE ON `clips` BEGIN DELETE FROM `clips_fts` WHERE `docid`=OLD.`rowid`; END");
        db.execSQL("CREATE TRIGGER IF NOT EXISTS room_fts_content_sync_clips_fts_BEFORE_DELETE BEFORE DELETE ON `clips` BEGIN DELETE FROM `clips_fts` WHERE `docid`=OLD.`rowid`; END");
        db.execSQL("CREATE TRIGGER IF NOT EXISTS room_fts_content_sync_clips_fts_AFTER_UPDATE AFTER UPDATE ON `clips` BEGIN INSERT INTO `clips_fts`(`docid`, `content`) VALUES (NEW.`rowid`, NEW.`content`); END");
        db.execSQL("CREATE TRIGGER IF NOT EXISTS room_fts_content_sync_clips_fts_AFTER_INSERT AFTER INSERT ON `clips` BEGIN INSERT INTO `clips_fts`(`docid`, `content`) VALUES (NEW.`rowid`, NEW.`content`); END");
      }

      @Override
      @NonNull
      public RoomOpenHelper.ValidationResult onValidateSchema(
          @NonNull final SupportSQLiteDatabase db) {
        final HashMap<String, TableInfo.Column> _columnsClips = new HashMap<String, TableInfo.Column>(15);
        _columnsClips.put("rowid", new TableInfo.Column("rowid", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("content", new TableInfo.Column("content", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("type", new TableInfo.Column("type", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("timestamp", new TableInfo.Column("timestamp", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("source_app_package", new TableInfo.Column("source_app_package", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("source_app_label", new TableInfo.Column("source_app_label", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("is_pinned", new TableInfo.Column("is_pinned", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("is_secret", new TableInfo.Column("is_secret", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("sensitive_type", new TableInfo.Column("sensitive_type", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("secret_expires_at", new TableInfo.Column("secret_expires_at", "INTEGER", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("image_uri", new TableInfo.Column("image_uri", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("thumbnail_uri", new TableInfo.Column("thumbnail_uri", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("contentHash", new TableInfo.Column("contentHash", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("char_count", new TableInfo.Column("char_count", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsClips.put("word_count", new TableInfo.Column("word_count", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysClips = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesClips = new HashSet<TableInfo.Index>(4);
        _indicesClips.add(new TableInfo.Index("index_clips_contentHash", false, Arrays.asList("contentHash"), Arrays.asList("ASC")));
        _indicesClips.add(new TableInfo.Index("index_clips_timestamp", false, Arrays.asList("timestamp"), Arrays.asList("ASC")));
        _indicesClips.add(new TableInfo.Index("index_clips_is_pinned", false, Arrays.asList("is_pinned"), Arrays.asList("ASC")));
        _indicesClips.add(new TableInfo.Index("index_clips_is_secret", false, Arrays.asList("is_secret"), Arrays.asList("ASC")));
        final TableInfo _infoClips = new TableInfo("clips", _columnsClips, _foreignKeysClips, _indicesClips);
        final TableInfo _existingClips = TableInfo.read(db, "clips");
        if (!_infoClips.equals(_existingClips)) {
          return new RoomOpenHelper.ValidationResult(false, "clips(com.cliplocker.app.data.local.ClipEntity).\n"
                  + " Expected:\n" + _infoClips + "\n"
                  + " Found:\n" + _existingClips);
        }
        final HashSet<String> _columnsClipsFts = new HashSet<String>(1);
        _columnsClipsFts.add("content");
        final FtsTableInfo _infoClipsFts = new FtsTableInfo("clips_fts", _columnsClipsFts, "CREATE VIRTUAL TABLE IF NOT EXISTS `clips_fts` USING FTS4(`content` TEXT NOT NULL, content=`clips`)");
        final FtsTableInfo _existingClipsFts = FtsTableInfo.read(db, "clips_fts");
        if (!_infoClipsFts.equals(_existingClipsFts)) {
          return new RoomOpenHelper.ValidationResult(false, "clips_fts(com.cliplocker.app.data.local.ClipFtsEntity).\n"
                  + " Expected:\n" + _infoClipsFts + "\n"
                  + " Found:\n" + _existingClipsFts);
        }
        final HashMap<String, TableInfo.Column> _columnsIgnoredApps = new HashMap<String, TableInfo.Column>(3);
        _columnsIgnoredApps.put("package_name", new TableInfo.Column("package_name", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsIgnoredApps.put("app_label", new TableInfo.Column("app_label", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsIgnoredApps.put("date_added", new TableInfo.Column("date_added", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysIgnoredApps = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesIgnoredApps = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoIgnoredApps = new TableInfo("ignored_apps", _columnsIgnoredApps, _foreignKeysIgnoredApps, _indicesIgnoredApps);
        final TableInfo _existingIgnoredApps = TableInfo.read(db, "ignored_apps");
        if (!_infoIgnoredApps.equals(_existingIgnoredApps)) {
          return new RoomOpenHelper.ValidationResult(false, "ignored_apps(com.cliplocker.app.data.local.IgnoreAppEntity).\n"
                  + " Expected:\n" + _infoIgnoredApps + "\n"
                  + " Found:\n" + _existingIgnoredApps);
        }
        return new RoomOpenHelper.ValidationResult(true, null);
      }
    }, "72d4eec598cea1bb547c181c9fed1738", "eb596913364883a1d9595181504a192b");
    final SupportSQLiteOpenHelper.Configuration _sqliteConfig = SupportSQLiteOpenHelper.Configuration.builder(config.context).name(config.name).callback(_openCallback).build();
    final SupportSQLiteOpenHelper _helper = config.sqliteOpenHelperFactory.create(_sqliteConfig);
    return _helper;
  }

  @Override
  @NonNull
  protected InvalidationTracker createInvalidationTracker() {
    final HashMap<String, String> _shadowTablesMap = new HashMap<String, String>(1);
    _shadowTablesMap.put("clips_fts", "clips");
    final HashMap<String, Set<String>> _viewTables = new HashMap<String, Set<String>>(0);
    return new InvalidationTracker(this, _shadowTablesMap, _viewTables, "clips","clips_fts","ignored_apps");
  }

  @Override
  public void clearAllTables() {
    super.assertNotMainThread();
    final SupportSQLiteDatabase _db = super.getOpenHelper().getWritableDatabase();
    try {
      super.beginTransaction();
      _db.execSQL("DELETE FROM `clips`");
      _db.execSQL("DELETE FROM `clips_fts`");
      _db.execSQL("DELETE FROM `ignored_apps`");
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
    _typeConvertersMap.put(ClipDao.class, ClipDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(IgnoreAppDao.class, IgnoreAppDao_Impl.getRequiredConverters());
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
  public ClipDao clipDao() {
    if (_clipDao != null) {
      return _clipDao;
    } else {
      synchronized(this) {
        if(_clipDao == null) {
          _clipDao = new ClipDao_Impl(this);
        }
        return _clipDao;
      }
    }
  }

  @Override
  public IgnoreAppDao ignoreAppDao() {
    if (_ignoreAppDao != null) {
      return _ignoreAppDao;
    } else {
      synchronized(this) {
        if(_ignoreAppDao == null) {
          _ignoreAppDao = new IgnoreAppDao_Impl(this);
        }
        return _ignoreAppDao;
      }
    }
  }
}

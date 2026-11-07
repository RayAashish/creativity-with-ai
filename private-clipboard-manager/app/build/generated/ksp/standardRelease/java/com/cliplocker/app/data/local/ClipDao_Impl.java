package com.cliplocker.app.data.local;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityDeletionOrUpdateAdapter;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.SharedSQLiteStatement;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.room.util.StringUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Integer;
import java.lang.Long;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.StringBuilder;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import javax.annotation.processing.Generated;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import kotlinx.coroutines.flow.Flow;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class ClipDao_Impl implements ClipDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<ClipEntity> __insertionAdapterOfClipEntity;

  private final EntityDeletionOrUpdateAdapter<ClipEntity> __updateAdapterOfClipEntity;

  private final SharedSQLiteStatement __preparedStmtOfDeleteClipById;

  private final SharedSQLiteStatement __preparedStmtOfClearAllNonPinned;

  private final SharedSQLiteStatement __preparedStmtOfSetPinned;

  private final SharedSQLiteStatement __preparedStmtOfSetSecret;

  private final SharedSQLiteStatement __preparedStmtOfDeleteExpiredSecrets;

  private final SharedSQLiteStatement __preparedStmtOfPruneOldestNonPinned;

  private final SharedSQLiteStatement __preparedStmtOfPruneOlderThan;

  public ClipDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfClipEntity = new EntityInsertionAdapter<ClipEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `clips` (`rowid`,`content`,`type`,`timestamp`,`source_app_package`,`source_app_label`,`is_pinned`,`is_secret`,`sensitive_type`,`secret_expires_at`,`image_uri`,`thumbnail_uri`,`contentHash`,`char_count`,`word_count`) VALUES (nullif(?, 0),?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final ClipEntity entity) {
        statement.bindLong(1, entity.getId());
        statement.bindString(2, entity.getContent());
        statement.bindString(3, entity.getType());
        statement.bindLong(4, entity.getTimestamp());
        if (entity.getSourceAppPackage() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getSourceAppPackage());
        }
        if (entity.getSourceAppLabel() == null) {
          statement.bindNull(6);
        } else {
          statement.bindString(6, entity.getSourceAppLabel());
        }
        final int _tmp = entity.isPinned() ? 1 : 0;
        statement.bindLong(7, _tmp);
        final int _tmp_1 = entity.isSecret() ? 1 : 0;
        statement.bindLong(8, _tmp_1);
        statement.bindString(9, entity.getSensitiveType());
        if (entity.getSecretExpiresAt() == null) {
          statement.bindNull(10);
        } else {
          statement.bindLong(10, entity.getSecretExpiresAt());
        }
        if (entity.getImageUri() == null) {
          statement.bindNull(11);
        } else {
          statement.bindString(11, entity.getImageUri());
        }
        if (entity.getThumbnailUri() == null) {
          statement.bindNull(12);
        } else {
          statement.bindString(12, entity.getThumbnailUri());
        }
        statement.bindString(13, entity.getContentHash());
        statement.bindLong(14, entity.getCharCount());
        statement.bindLong(15, entity.getWordCount());
      }
    };
    this.__updateAdapterOfClipEntity = new EntityDeletionOrUpdateAdapter<ClipEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "UPDATE OR ABORT `clips` SET `rowid` = ?,`content` = ?,`type` = ?,`timestamp` = ?,`source_app_package` = ?,`source_app_label` = ?,`is_pinned` = ?,`is_secret` = ?,`sensitive_type` = ?,`secret_expires_at` = ?,`image_uri` = ?,`thumbnail_uri` = ?,`contentHash` = ?,`char_count` = ?,`word_count` = ? WHERE `rowid` = ?";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final ClipEntity entity) {
        statement.bindLong(1, entity.getId());
        statement.bindString(2, entity.getContent());
        statement.bindString(3, entity.getType());
        statement.bindLong(4, entity.getTimestamp());
        if (entity.getSourceAppPackage() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getSourceAppPackage());
        }
        if (entity.getSourceAppLabel() == null) {
          statement.bindNull(6);
        } else {
          statement.bindString(6, entity.getSourceAppLabel());
        }
        final int _tmp = entity.isPinned() ? 1 : 0;
        statement.bindLong(7, _tmp);
        final int _tmp_1 = entity.isSecret() ? 1 : 0;
        statement.bindLong(8, _tmp_1);
        statement.bindString(9, entity.getSensitiveType());
        if (entity.getSecretExpiresAt() == null) {
          statement.bindNull(10);
        } else {
          statement.bindLong(10, entity.getSecretExpiresAt());
        }
        if (entity.getImageUri() == null) {
          statement.bindNull(11);
        } else {
          statement.bindString(11, entity.getImageUri());
        }
        if (entity.getThumbnailUri() == null) {
          statement.bindNull(12);
        } else {
          statement.bindString(12, entity.getThumbnailUri());
        }
        statement.bindString(13, entity.getContentHash());
        statement.bindLong(14, entity.getCharCount());
        statement.bindLong(15, entity.getWordCount());
        statement.bindLong(16, entity.getId());
      }
    };
    this.__preparedStmtOfDeleteClipById = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM clips WHERE rowid = ?";
        return _query;
      }
    };
    this.__preparedStmtOfClearAllNonPinned = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM clips WHERE is_pinned = 0";
        return _query;
      }
    };
    this.__preparedStmtOfSetPinned = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "UPDATE clips SET is_pinned = ? WHERE rowid = ?";
        return _query;
      }
    };
    this.__preparedStmtOfSetSecret = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "UPDATE clips SET is_secret = ?, secret_expires_at = ? WHERE rowid = ?";
        return _query;
      }
    };
    this.__preparedStmtOfDeleteExpiredSecrets = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM clips WHERE is_secret = 1 AND secret_expires_at IS NOT NULL AND secret_expires_at <= ?";
        return _query;
      }
    };
    this.__preparedStmtOfPruneOldestNonPinned = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "\n"
                + "        DELETE FROM clips WHERE rowid IN (\n"
                + "            SELECT rowid FROM clips\n"
                + "            WHERE is_pinned = 0\n"
                + "            ORDER BY timestamp ASC\n"
                + "            LIMIT (SELECT CASE WHEN COUNT(*) > ? THEN COUNT(*) - ? ELSE 0 END FROM clips WHERE is_pinned = 0)\n"
                + "        )\n"
                + "        ";
        return _query;
      }
    };
    this.__preparedStmtOfPruneOlderThan = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM clips WHERE is_pinned = 0 AND timestamp < ?";
        return _query;
      }
    };
  }

  @Override
  public Object insertClip(final ClipEntity clip, final Continuation<? super Long> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Long>() {
      @Override
      @NonNull
      public Long call() throws Exception {
        __db.beginTransaction();
        try {
          final Long _result = __insertionAdapterOfClipEntity.insertAndReturnId(clip);
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object insertClips(final List<ClipEntity> clips,
      final Continuation<? super List<Long>> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<List<Long>>() {
      @Override
      @NonNull
      public List<Long> call() throws Exception {
        __db.beginTransaction();
        try {
          final List<Long> _result = __insertionAdapterOfClipEntity.insertAndReturnIdsList(clips);
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object updateClip(final ClipEntity clip, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __updateAdapterOfClipEntity.handle(clip);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object deleteClipById(final long id, final Continuation<? super Integer> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Integer>() {
      @Override
      @NonNull
      public Integer call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfDeleteClipById.acquire();
        int _argIndex = 1;
        _stmt.bindLong(_argIndex, id);
        try {
          __db.beginTransaction();
          try {
            final Integer _result = _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return _result;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfDeleteClipById.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object clearAllNonPinned(final Continuation<? super Integer> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Integer>() {
      @Override
      @NonNull
      public Integer call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfClearAllNonPinned.acquire();
        try {
          __db.beginTransaction();
          try {
            final Integer _result = _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return _result;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfClearAllNonPinned.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object setPinned(final long id, final boolean isPinned,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfSetPinned.acquire();
        int _argIndex = 1;
        final int _tmp = isPinned ? 1 : 0;
        _stmt.bindLong(_argIndex, _tmp);
        _argIndex = 2;
        _stmt.bindLong(_argIndex, id);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfSetPinned.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object setSecret(final long id, final boolean isSecret, final Long expiresAt,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfSetSecret.acquire();
        int _argIndex = 1;
        final int _tmp = isSecret ? 1 : 0;
        _stmt.bindLong(_argIndex, _tmp);
        _argIndex = 2;
        if (expiresAt == null) {
          _stmt.bindNull(_argIndex);
        } else {
          _stmt.bindLong(_argIndex, expiresAt);
        }
        _argIndex = 3;
        _stmt.bindLong(_argIndex, id);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfSetSecret.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object deleteExpiredSecrets(final long now,
      final Continuation<? super Integer> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Integer>() {
      @Override
      @NonNull
      public Integer call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfDeleteExpiredSecrets.acquire();
        int _argIndex = 1;
        _stmt.bindLong(_argIndex, now);
        try {
          __db.beginTransaction();
          try {
            final Integer _result = _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return _result;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfDeleteExpiredSecrets.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object pruneOldestNonPinned(final int maxCount,
      final Continuation<? super Integer> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Integer>() {
      @Override
      @NonNull
      public Integer call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfPruneOldestNonPinned.acquire();
        int _argIndex = 1;
        _stmt.bindLong(_argIndex, maxCount);
        _argIndex = 2;
        _stmt.bindLong(_argIndex, maxCount);
        try {
          __db.beginTransaction();
          try {
            final Integer _result = _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return _result;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfPruneOldestNonPinned.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object pruneOlderThan(final long cutoffTimestamp,
      final Continuation<? super Integer> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Integer>() {
      @Override
      @NonNull
      public Integer call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfPruneOlderThan.acquire();
        int _argIndex = 1;
        _stmt.bindLong(_argIndex, cutoffTimestamp);
        try {
          __db.beginTransaction();
          try {
            final Integer _result = _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return _result;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfPruneOlderThan.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Flow<List<ClipEntity>> getAllClips() {
    final String _sql = "SELECT * FROM clips ORDER BY timestamp DESC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"clips"}, new Callable<List<ClipEntity>>() {
      @Override
      @NonNull
      public List<ClipEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "rowid");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfType = CursorUtil.getColumnIndexOrThrow(_cursor, "type");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfSourceAppPackage = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_package");
          final int _cursorIndexOfSourceAppLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_label");
          final int _cursorIndexOfIsPinned = CursorUtil.getColumnIndexOrThrow(_cursor, "is_pinned");
          final int _cursorIndexOfIsSecret = CursorUtil.getColumnIndexOrThrow(_cursor, "is_secret");
          final int _cursorIndexOfSensitiveType = CursorUtil.getColumnIndexOrThrow(_cursor, "sensitive_type");
          final int _cursorIndexOfSecretExpiresAt = CursorUtil.getColumnIndexOrThrow(_cursor, "secret_expires_at");
          final int _cursorIndexOfImageUri = CursorUtil.getColumnIndexOrThrow(_cursor, "image_uri");
          final int _cursorIndexOfThumbnailUri = CursorUtil.getColumnIndexOrThrow(_cursor, "thumbnail_uri");
          final int _cursorIndexOfContentHash = CursorUtil.getColumnIndexOrThrow(_cursor, "contentHash");
          final int _cursorIndexOfCharCount = CursorUtil.getColumnIndexOrThrow(_cursor, "char_count");
          final int _cursorIndexOfWordCount = CursorUtil.getColumnIndexOrThrow(_cursor, "word_count");
          final List<ClipEntity> _result = new ArrayList<ClipEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final ClipEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpContent;
            _tmpContent = _cursor.getString(_cursorIndexOfContent);
            final String _tmpType;
            _tmpType = _cursor.getString(_cursorIndexOfType);
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            final String _tmpSourceAppPackage;
            if (_cursor.isNull(_cursorIndexOfSourceAppPackage)) {
              _tmpSourceAppPackage = null;
            } else {
              _tmpSourceAppPackage = _cursor.getString(_cursorIndexOfSourceAppPackage);
            }
            final String _tmpSourceAppLabel;
            if (_cursor.isNull(_cursorIndexOfSourceAppLabel)) {
              _tmpSourceAppLabel = null;
            } else {
              _tmpSourceAppLabel = _cursor.getString(_cursorIndexOfSourceAppLabel);
            }
            final boolean _tmpIsPinned;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsPinned);
            _tmpIsPinned = _tmp != 0;
            final boolean _tmpIsSecret;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsSecret);
            _tmpIsSecret = _tmp_1 != 0;
            final String _tmpSensitiveType;
            _tmpSensitiveType = _cursor.getString(_cursorIndexOfSensitiveType);
            final Long _tmpSecretExpiresAt;
            if (_cursor.isNull(_cursorIndexOfSecretExpiresAt)) {
              _tmpSecretExpiresAt = null;
            } else {
              _tmpSecretExpiresAt = _cursor.getLong(_cursorIndexOfSecretExpiresAt);
            }
            final String _tmpImageUri;
            if (_cursor.isNull(_cursorIndexOfImageUri)) {
              _tmpImageUri = null;
            } else {
              _tmpImageUri = _cursor.getString(_cursorIndexOfImageUri);
            }
            final String _tmpThumbnailUri;
            if (_cursor.isNull(_cursorIndexOfThumbnailUri)) {
              _tmpThumbnailUri = null;
            } else {
              _tmpThumbnailUri = _cursor.getString(_cursorIndexOfThumbnailUri);
            }
            final String _tmpContentHash;
            _tmpContentHash = _cursor.getString(_cursorIndexOfContentHash);
            final int _tmpCharCount;
            _tmpCharCount = _cursor.getInt(_cursorIndexOfCharCount);
            final int _tmpWordCount;
            _tmpWordCount = _cursor.getInt(_cursorIndexOfWordCount);
            _item = new ClipEntity(_tmpId,_tmpContent,_tmpType,_tmpTimestamp,_tmpSourceAppPackage,_tmpSourceAppLabel,_tmpIsPinned,_tmpIsSecret,_tmpSensitiveType,_tmpSecretExpiresAt,_tmpImageUri,_tmpThumbnailUri,_tmpContentHash,_tmpCharCount,_tmpWordCount);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Flow<List<ClipEntity>> getPinnedClips() {
    final String _sql = "SELECT * FROM clips WHERE is_pinned = 1 ORDER BY timestamp DESC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"clips"}, new Callable<List<ClipEntity>>() {
      @Override
      @NonNull
      public List<ClipEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "rowid");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfType = CursorUtil.getColumnIndexOrThrow(_cursor, "type");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfSourceAppPackage = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_package");
          final int _cursorIndexOfSourceAppLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_label");
          final int _cursorIndexOfIsPinned = CursorUtil.getColumnIndexOrThrow(_cursor, "is_pinned");
          final int _cursorIndexOfIsSecret = CursorUtil.getColumnIndexOrThrow(_cursor, "is_secret");
          final int _cursorIndexOfSensitiveType = CursorUtil.getColumnIndexOrThrow(_cursor, "sensitive_type");
          final int _cursorIndexOfSecretExpiresAt = CursorUtil.getColumnIndexOrThrow(_cursor, "secret_expires_at");
          final int _cursorIndexOfImageUri = CursorUtil.getColumnIndexOrThrow(_cursor, "image_uri");
          final int _cursorIndexOfThumbnailUri = CursorUtil.getColumnIndexOrThrow(_cursor, "thumbnail_uri");
          final int _cursorIndexOfContentHash = CursorUtil.getColumnIndexOrThrow(_cursor, "contentHash");
          final int _cursorIndexOfCharCount = CursorUtil.getColumnIndexOrThrow(_cursor, "char_count");
          final int _cursorIndexOfWordCount = CursorUtil.getColumnIndexOrThrow(_cursor, "word_count");
          final List<ClipEntity> _result = new ArrayList<ClipEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final ClipEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpContent;
            _tmpContent = _cursor.getString(_cursorIndexOfContent);
            final String _tmpType;
            _tmpType = _cursor.getString(_cursorIndexOfType);
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            final String _tmpSourceAppPackage;
            if (_cursor.isNull(_cursorIndexOfSourceAppPackage)) {
              _tmpSourceAppPackage = null;
            } else {
              _tmpSourceAppPackage = _cursor.getString(_cursorIndexOfSourceAppPackage);
            }
            final String _tmpSourceAppLabel;
            if (_cursor.isNull(_cursorIndexOfSourceAppLabel)) {
              _tmpSourceAppLabel = null;
            } else {
              _tmpSourceAppLabel = _cursor.getString(_cursorIndexOfSourceAppLabel);
            }
            final boolean _tmpIsPinned;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsPinned);
            _tmpIsPinned = _tmp != 0;
            final boolean _tmpIsSecret;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsSecret);
            _tmpIsSecret = _tmp_1 != 0;
            final String _tmpSensitiveType;
            _tmpSensitiveType = _cursor.getString(_cursorIndexOfSensitiveType);
            final Long _tmpSecretExpiresAt;
            if (_cursor.isNull(_cursorIndexOfSecretExpiresAt)) {
              _tmpSecretExpiresAt = null;
            } else {
              _tmpSecretExpiresAt = _cursor.getLong(_cursorIndexOfSecretExpiresAt);
            }
            final String _tmpImageUri;
            if (_cursor.isNull(_cursorIndexOfImageUri)) {
              _tmpImageUri = null;
            } else {
              _tmpImageUri = _cursor.getString(_cursorIndexOfImageUri);
            }
            final String _tmpThumbnailUri;
            if (_cursor.isNull(_cursorIndexOfThumbnailUri)) {
              _tmpThumbnailUri = null;
            } else {
              _tmpThumbnailUri = _cursor.getString(_cursorIndexOfThumbnailUri);
            }
            final String _tmpContentHash;
            _tmpContentHash = _cursor.getString(_cursorIndexOfContentHash);
            final int _tmpCharCount;
            _tmpCharCount = _cursor.getInt(_cursorIndexOfCharCount);
            final int _tmpWordCount;
            _tmpWordCount = _cursor.getInt(_cursorIndexOfWordCount);
            _item = new ClipEntity(_tmpId,_tmpContent,_tmpType,_tmpTimestamp,_tmpSourceAppPackage,_tmpSourceAppLabel,_tmpIsPinned,_tmpIsSecret,_tmpSensitiveType,_tmpSecretExpiresAt,_tmpImageUri,_tmpThumbnailUri,_tmpContentHash,_tmpCharCount,_tmpWordCount);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Flow<List<ClipEntity>> getRecentClips(final int limit) {
    final String _sql = "SELECT * FROM clips ORDER BY timestamp DESC LIMIT ?";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, limit);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"clips"}, new Callable<List<ClipEntity>>() {
      @Override
      @NonNull
      public List<ClipEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "rowid");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfType = CursorUtil.getColumnIndexOrThrow(_cursor, "type");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfSourceAppPackage = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_package");
          final int _cursorIndexOfSourceAppLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_label");
          final int _cursorIndexOfIsPinned = CursorUtil.getColumnIndexOrThrow(_cursor, "is_pinned");
          final int _cursorIndexOfIsSecret = CursorUtil.getColumnIndexOrThrow(_cursor, "is_secret");
          final int _cursorIndexOfSensitiveType = CursorUtil.getColumnIndexOrThrow(_cursor, "sensitive_type");
          final int _cursorIndexOfSecretExpiresAt = CursorUtil.getColumnIndexOrThrow(_cursor, "secret_expires_at");
          final int _cursorIndexOfImageUri = CursorUtil.getColumnIndexOrThrow(_cursor, "image_uri");
          final int _cursorIndexOfThumbnailUri = CursorUtil.getColumnIndexOrThrow(_cursor, "thumbnail_uri");
          final int _cursorIndexOfContentHash = CursorUtil.getColumnIndexOrThrow(_cursor, "contentHash");
          final int _cursorIndexOfCharCount = CursorUtil.getColumnIndexOrThrow(_cursor, "char_count");
          final int _cursorIndexOfWordCount = CursorUtil.getColumnIndexOrThrow(_cursor, "word_count");
          final List<ClipEntity> _result = new ArrayList<ClipEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final ClipEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpContent;
            _tmpContent = _cursor.getString(_cursorIndexOfContent);
            final String _tmpType;
            _tmpType = _cursor.getString(_cursorIndexOfType);
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            final String _tmpSourceAppPackage;
            if (_cursor.isNull(_cursorIndexOfSourceAppPackage)) {
              _tmpSourceAppPackage = null;
            } else {
              _tmpSourceAppPackage = _cursor.getString(_cursorIndexOfSourceAppPackage);
            }
            final String _tmpSourceAppLabel;
            if (_cursor.isNull(_cursorIndexOfSourceAppLabel)) {
              _tmpSourceAppLabel = null;
            } else {
              _tmpSourceAppLabel = _cursor.getString(_cursorIndexOfSourceAppLabel);
            }
            final boolean _tmpIsPinned;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsPinned);
            _tmpIsPinned = _tmp != 0;
            final boolean _tmpIsSecret;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsSecret);
            _tmpIsSecret = _tmp_1 != 0;
            final String _tmpSensitiveType;
            _tmpSensitiveType = _cursor.getString(_cursorIndexOfSensitiveType);
            final Long _tmpSecretExpiresAt;
            if (_cursor.isNull(_cursorIndexOfSecretExpiresAt)) {
              _tmpSecretExpiresAt = null;
            } else {
              _tmpSecretExpiresAt = _cursor.getLong(_cursorIndexOfSecretExpiresAt);
            }
            final String _tmpImageUri;
            if (_cursor.isNull(_cursorIndexOfImageUri)) {
              _tmpImageUri = null;
            } else {
              _tmpImageUri = _cursor.getString(_cursorIndexOfImageUri);
            }
            final String _tmpThumbnailUri;
            if (_cursor.isNull(_cursorIndexOfThumbnailUri)) {
              _tmpThumbnailUri = null;
            } else {
              _tmpThumbnailUri = _cursor.getString(_cursorIndexOfThumbnailUri);
            }
            final String _tmpContentHash;
            _tmpContentHash = _cursor.getString(_cursorIndexOfContentHash);
            final int _tmpCharCount;
            _tmpCharCount = _cursor.getInt(_cursorIndexOfCharCount);
            final int _tmpWordCount;
            _tmpWordCount = _cursor.getInt(_cursorIndexOfWordCount);
            _item = new ClipEntity(_tmpId,_tmpContent,_tmpType,_tmpTimestamp,_tmpSourceAppPackage,_tmpSourceAppLabel,_tmpIsPinned,_tmpIsSecret,_tmpSensitiveType,_tmpSecretExpiresAt,_tmpImageUri,_tmpThumbnailUri,_tmpContentHash,_tmpCharCount,_tmpWordCount);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Flow<ClipEntity> getClipById(final long id) {
    final String _sql = "SELECT * FROM clips WHERE rowid = ?";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, id);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"clips"}, new Callable<ClipEntity>() {
      @Override
      @Nullable
      public ClipEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "rowid");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfType = CursorUtil.getColumnIndexOrThrow(_cursor, "type");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfSourceAppPackage = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_package");
          final int _cursorIndexOfSourceAppLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_label");
          final int _cursorIndexOfIsPinned = CursorUtil.getColumnIndexOrThrow(_cursor, "is_pinned");
          final int _cursorIndexOfIsSecret = CursorUtil.getColumnIndexOrThrow(_cursor, "is_secret");
          final int _cursorIndexOfSensitiveType = CursorUtil.getColumnIndexOrThrow(_cursor, "sensitive_type");
          final int _cursorIndexOfSecretExpiresAt = CursorUtil.getColumnIndexOrThrow(_cursor, "secret_expires_at");
          final int _cursorIndexOfImageUri = CursorUtil.getColumnIndexOrThrow(_cursor, "image_uri");
          final int _cursorIndexOfThumbnailUri = CursorUtil.getColumnIndexOrThrow(_cursor, "thumbnail_uri");
          final int _cursorIndexOfContentHash = CursorUtil.getColumnIndexOrThrow(_cursor, "contentHash");
          final int _cursorIndexOfCharCount = CursorUtil.getColumnIndexOrThrow(_cursor, "char_count");
          final int _cursorIndexOfWordCount = CursorUtil.getColumnIndexOrThrow(_cursor, "word_count");
          final ClipEntity _result;
          if (_cursor.moveToFirst()) {
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpContent;
            _tmpContent = _cursor.getString(_cursorIndexOfContent);
            final String _tmpType;
            _tmpType = _cursor.getString(_cursorIndexOfType);
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            final String _tmpSourceAppPackage;
            if (_cursor.isNull(_cursorIndexOfSourceAppPackage)) {
              _tmpSourceAppPackage = null;
            } else {
              _tmpSourceAppPackage = _cursor.getString(_cursorIndexOfSourceAppPackage);
            }
            final String _tmpSourceAppLabel;
            if (_cursor.isNull(_cursorIndexOfSourceAppLabel)) {
              _tmpSourceAppLabel = null;
            } else {
              _tmpSourceAppLabel = _cursor.getString(_cursorIndexOfSourceAppLabel);
            }
            final boolean _tmpIsPinned;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsPinned);
            _tmpIsPinned = _tmp != 0;
            final boolean _tmpIsSecret;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsSecret);
            _tmpIsSecret = _tmp_1 != 0;
            final String _tmpSensitiveType;
            _tmpSensitiveType = _cursor.getString(_cursorIndexOfSensitiveType);
            final Long _tmpSecretExpiresAt;
            if (_cursor.isNull(_cursorIndexOfSecretExpiresAt)) {
              _tmpSecretExpiresAt = null;
            } else {
              _tmpSecretExpiresAt = _cursor.getLong(_cursorIndexOfSecretExpiresAt);
            }
            final String _tmpImageUri;
            if (_cursor.isNull(_cursorIndexOfImageUri)) {
              _tmpImageUri = null;
            } else {
              _tmpImageUri = _cursor.getString(_cursorIndexOfImageUri);
            }
            final String _tmpThumbnailUri;
            if (_cursor.isNull(_cursorIndexOfThumbnailUri)) {
              _tmpThumbnailUri = null;
            } else {
              _tmpThumbnailUri = _cursor.getString(_cursorIndexOfThumbnailUri);
            }
            final String _tmpContentHash;
            _tmpContentHash = _cursor.getString(_cursorIndexOfContentHash);
            final int _tmpCharCount;
            _tmpCharCount = _cursor.getInt(_cursorIndexOfCharCount);
            final int _tmpWordCount;
            _tmpWordCount = _cursor.getInt(_cursorIndexOfWordCount);
            _result = new ClipEntity(_tmpId,_tmpContent,_tmpType,_tmpTimestamp,_tmpSourceAppPackage,_tmpSourceAppLabel,_tmpIsPinned,_tmpIsSecret,_tmpSensitiveType,_tmpSecretExpiresAt,_tmpImageUri,_tmpThumbnailUri,_tmpContentHash,_tmpCharCount,_tmpWordCount);
          } else {
            _result = null;
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Object getClipByIdSync(final long id, final Continuation<? super ClipEntity> $completion) {
    final String _sql = "SELECT * FROM clips WHERE rowid = ?";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, id);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<ClipEntity>() {
      @Override
      @Nullable
      public ClipEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "rowid");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfType = CursorUtil.getColumnIndexOrThrow(_cursor, "type");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfSourceAppPackage = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_package");
          final int _cursorIndexOfSourceAppLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_label");
          final int _cursorIndexOfIsPinned = CursorUtil.getColumnIndexOrThrow(_cursor, "is_pinned");
          final int _cursorIndexOfIsSecret = CursorUtil.getColumnIndexOrThrow(_cursor, "is_secret");
          final int _cursorIndexOfSensitiveType = CursorUtil.getColumnIndexOrThrow(_cursor, "sensitive_type");
          final int _cursorIndexOfSecretExpiresAt = CursorUtil.getColumnIndexOrThrow(_cursor, "secret_expires_at");
          final int _cursorIndexOfImageUri = CursorUtil.getColumnIndexOrThrow(_cursor, "image_uri");
          final int _cursorIndexOfThumbnailUri = CursorUtil.getColumnIndexOrThrow(_cursor, "thumbnail_uri");
          final int _cursorIndexOfContentHash = CursorUtil.getColumnIndexOrThrow(_cursor, "contentHash");
          final int _cursorIndexOfCharCount = CursorUtil.getColumnIndexOrThrow(_cursor, "char_count");
          final int _cursorIndexOfWordCount = CursorUtil.getColumnIndexOrThrow(_cursor, "word_count");
          final ClipEntity _result;
          if (_cursor.moveToFirst()) {
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpContent;
            _tmpContent = _cursor.getString(_cursorIndexOfContent);
            final String _tmpType;
            _tmpType = _cursor.getString(_cursorIndexOfType);
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            final String _tmpSourceAppPackage;
            if (_cursor.isNull(_cursorIndexOfSourceAppPackage)) {
              _tmpSourceAppPackage = null;
            } else {
              _tmpSourceAppPackage = _cursor.getString(_cursorIndexOfSourceAppPackage);
            }
            final String _tmpSourceAppLabel;
            if (_cursor.isNull(_cursorIndexOfSourceAppLabel)) {
              _tmpSourceAppLabel = null;
            } else {
              _tmpSourceAppLabel = _cursor.getString(_cursorIndexOfSourceAppLabel);
            }
            final boolean _tmpIsPinned;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsPinned);
            _tmpIsPinned = _tmp != 0;
            final boolean _tmpIsSecret;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsSecret);
            _tmpIsSecret = _tmp_1 != 0;
            final String _tmpSensitiveType;
            _tmpSensitiveType = _cursor.getString(_cursorIndexOfSensitiveType);
            final Long _tmpSecretExpiresAt;
            if (_cursor.isNull(_cursorIndexOfSecretExpiresAt)) {
              _tmpSecretExpiresAt = null;
            } else {
              _tmpSecretExpiresAt = _cursor.getLong(_cursorIndexOfSecretExpiresAt);
            }
            final String _tmpImageUri;
            if (_cursor.isNull(_cursorIndexOfImageUri)) {
              _tmpImageUri = null;
            } else {
              _tmpImageUri = _cursor.getString(_cursorIndexOfImageUri);
            }
            final String _tmpThumbnailUri;
            if (_cursor.isNull(_cursorIndexOfThumbnailUri)) {
              _tmpThumbnailUri = null;
            } else {
              _tmpThumbnailUri = _cursor.getString(_cursorIndexOfThumbnailUri);
            }
            final String _tmpContentHash;
            _tmpContentHash = _cursor.getString(_cursorIndexOfContentHash);
            final int _tmpCharCount;
            _tmpCharCount = _cursor.getInt(_cursorIndexOfCharCount);
            final int _tmpWordCount;
            _tmpWordCount = _cursor.getInt(_cursorIndexOfWordCount);
            _result = new ClipEntity(_tmpId,_tmpContent,_tmpType,_tmpTimestamp,_tmpSourceAppPackage,_tmpSourceAppLabel,_tmpIsPinned,_tmpIsSecret,_tmpSensitiveType,_tmpSecretExpiresAt,_tmpImageUri,_tmpThumbnailUri,_tmpContentHash,_tmpCharCount,_tmpWordCount);
          } else {
            _result = null;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Object getLatestClip(final Continuation<? super ClipEntity> $completion) {
    final String _sql = "SELECT * FROM clips ORDER BY timestamp DESC LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<ClipEntity>() {
      @Override
      @Nullable
      public ClipEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "rowid");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfType = CursorUtil.getColumnIndexOrThrow(_cursor, "type");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfSourceAppPackage = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_package");
          final int _cursorIndexOfSourceAppLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_label");
          final int _cursorIndexOfIsPinned = CursorUtil.getColumnIndexOrThrow(_cursor, "is_pinned");
          final int _cursorIndexOfIsSecret = CursorUtil.getColumnIndexOrThrow(_cursor, "is_secret");
          final int _cursorIndexOfSensitiveType = CursorUtil.getColumnIndexOrThrow(_cursor, "sensitive_type");
          final int _cursorIndexOfSecretExpiresAt = CursorUtil.getColumnIndexOrThrow(_cursor, "secret_expires_at");
          final int _cursorIndexOfImageUri = CursorUtil.getColumnIndexOrThrow(_cursor, "image_uri");
          final int _cursorIndexOfThumbnailUri = CursorUtil.getColumnIndexOrThrow(_cursor, "thumbnail_uri");
          final int _cursorIndexOfContentHash = CursorUtil.getColumnIndexOrThrow(_cursor, "contentHash");
          final int _cursorIndexOfCharCount = CursorUtil.getColumnIndexOrThrow(_cursor, "char_count");
          final int _cursorIndexOfWordCount = CursorUtil.getColumnIndexOrThrow(_cursor, "word_count");
          final ClipEntity _result;
          if (_cursor.moveToFirst()) {
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpContent;
            _tmpContent = _cursor.getString(_cursorIndexOfContent);
            final String _tmpType;
            _tmpType = _cursor.getString(_cursorIndexOfType);
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            final String _tmpSourceAppPackage;
            if (_cursor.isNull(_cursorIndexOfSourceAppPackage)) {
              _tmpSourceAppPackage = null;
            } else {
              _tmpSourceAppPackage = _cursor.getString(_cursorIndexOfSourceAppPackage);
            }
            final String _tmpSourceAppLabel;
            if (_cursor.isNull(_cursorIndexOfSourceAppLabel)) {
              _tmpSourceAppLabel = null;
            } else {
              _tmpSourceAppLabel = _cursor.getString(_cursorIndexOfSourceAppLabel);
            }
            final boolean _tmpIsPinned;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsPinned);
            _tmpIsPinned = _tmp != 0;
            final boolean _tmpIsSecret;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsSecret);
            _tmpIsSecret = _tmp_1 != 0;
            final String _tmpSensitiveType;
            _tmpSensitiveType = _cursor.getString(_cursorIndexOfSensitiveType);
            final Long _tmpSecretExpiresAt;
            if (_cursor.isNull(_cursorIndexOfSecretExpiresAt)) {
              _tmpSecretExpiresAt = null;
            } else {
              _tmpSecretExpiresAt = _cursor.getLong(_cursorIndexOfSecretExpiresAt);
            }
            final String _tmpImageUri;
            if (_cursor.isNull(_cursorIndexOfImageUri)) {
              _tmpImageUri = null;
            } else {
              _tmpImageUri = _cursor.getString(_cursorIndexOfImageUri);
            }
            final String _tmpThumbnailUri;
            if (_cursor.isNull(_cursorIndexOfThumbnailUri)) {
              _tmpThumbnailUri = null;
            } else {
              _tmpThumbnailUri = _cursor.getString(_cursorIndexOfThumbnailUri);
            }
            final String _tmpContentHash;
            _tmpContentHash = _cursor.getString(_cursorIndexOfContentHash);
            final int _tmpCharCount;
            _tmpCharCount = _cursor.getInt(_cursorIndexOfCharCount);
            final int _tmpWordCount;
            _tmpWordCount = _cursor.getInt(_cursorIndexOfWordCount);
            _result = new ClipEntity(_tmpId,_tmpContent,_tmpType,_tmpTimestamp,_tmpSourceAppPackage,_tmpSourceAppLabel,_tmpIsPinned,_tmpIsSecret,_tmpSensitiveType,_tmpSecretExpiresAt,_tmpImageUri,_tmpThumbnailUri,_tmpContentHash,_tmpCharCount,_tmpWordCount);
          } else {
            _result = null;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Object findClipByHash(final String hash,
      final Continuation<? super ClipEntity> $completion) {
    final String _sql = "SELECT * FROM clips WHERE contentHash = ? ORDER BY timestamp DESC LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindString(_argIndex, hash);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<ClipEntity>() {
      @Override
      @Nullable
      public ClipEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "rowid");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfType = CursorUtil.getColumnIndexOrThrow(_cursor, "type");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfSourceAppPackage = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_package");
          final int _cursorIndexOfSourceAppLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_label");
          final int _cursorIndexOfIsPinned = CursorUtil.getColumnIndexOrThrow(_cursor, "is_pinned");
          final int _cursorIndexOfIsSecret = CursorUtil.getColumnIndexOrThrow(_cursor, "is_secret");
          final int _cursorIndexOfSensitiveType = CursorUtil.getColumnIndexOrThrow(_cursor, "sensitive_type");
          final int _cursorIndexOfSecretExpiresAt = CursorUtil.getColumnIndexOrThrow(_cursor, "secret_expires_at");
          final int _cursorIndexOfImageUri = CursorUtil.getColumnIndexOrThrow(_cursor, "image_uri");
          final int _cursorIndexOfThumbnailUri = CursorUtil.getColumnIndexOrThrow(_cursor, "thumbnail_uri");
          final int _cursorIndexOfContentHash = CursorUtil.getColumnIndexOrThrow(_cursor, "contentHash");
          final int _cursorIndexOfCharCount = CursorUtil.getColumnIndexOrThrow(_cursor, "char_count");
          final int _cursorIndexOfWordCount = CursorUtil.getColumnIndexOrThrow(_cursor, "word_count");
          final ClipEntity _result;
          if (_cursor.moveToFirst()) {
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpContent;
            _tmpContent = _cursor.getString(_cursorIndexOfContent);
            final String _tmpType;
            _tmpType = _cursor.getString(_cursorIndexOfType);
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            final String _tmpSourceAppPackage;
            if (_cursor.isNull(_cursorIndexOfSourceAppPackage)) {
              _tmpSourceAppPackage = null;
            } else {
              _tmpSourceAppPackage = _cursor.getString(_cursorIndexOfSourceAppPackage);
            }
            final String _tmpSourceAppLabel;
            if (_cursor.isNull(_cursorIndexOfSourceAppLabel)) {
              _tmpSourceAppLabel = null;
            } else {
              _tmpSourceAppLabel = _cursor.getString(_cursorIndexOfSourceAppLabel);
            }
            final boolean _tmpIsPinned;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsPinned);
            _tmpIsPinned = _tmp != 0;
            final boolean _tmpIsSecret;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsSecret);
            _tmpIsSecret = _tmp_1 != 0;
            final String _tmpSensitiveType;
            _tmpSensitiveType = _cursor.getString(_cursorIndexOfSensitiveType);
            final Long _tmpSecretExpiresAt;
            if (_cursor.isNull(_cursorIndexOfSecretExpiresAt)) {
              _tmpSecretExpiresAt = null;
            } else {
              _tmpSecretExpiresAt = _cursor.getLong(_cursorIndexOfSecretExpiresAt);
            }
            final String _tmpImageUri;
            if (_cursor.isNull(_cursorIndexOfImageUri)) {
              _tmpImageUri = null;
            } else {
              _tmpImageUri = _cursor.getString(_cursorIndexOfImageUri);
            }
            final String _tmpThumbnailUri;
            if (_cursor.isNull(_cursorIndexOfThumbnailUri)) {
              _tmpThumbnailUri = null;
            } else {
              _tmpThumbnailUri = _cursor.getString(_cursorIndexOfThumbnailUri);
            }
            final String _tmpContentHash;
            _tmpContentHash = _cursor.getString(_cursorIndexOfContentHash);
            final int _tmpCharCount;
            _tmpCharCount = _cursor.getInt(_cursorIndexOfCharCount);
            final int _tmpWordCount;
            _tmpWordCount = _cursor.getInt(_cursorIndexOfWordCount);
            _result = new ClipEntity(_tmpId,_tmpContent,_tmpType,_tmpTimestamp,_tmpSourceAppPackage,_tmpSourceAppLabel,_tmpIsPinned,_tmpIsSecret,_tmpSensitiveType,_tmpSecretExpiresAt,_tmpImageUri,_tmpThumbnailUri,_tmpContentHash,_tmpCharCount,_tmpWordCount);
          } else {
            _result = null;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Flow<List<ClipEntity>> searchFts(final String query) {
    final String _sql = "\n"
            + "        SELECT clips.* FROM clips\n"
            + "        JOIN clips_fts ON clips.rowid = clips_fts.docid\n"
            + "        WHERE clips_fts MATCH ?\n"
            + "        ORDER BY clips.timestamp DESC\n"
            + "        ";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindString(_argIndex, query);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"clips",
        "clips_fts"}, new Callable<List<ClipEntity>>() {
      @Override
      @NonNull
      public List<ClipEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "rowid");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfType = CursorUtil.getColumnIndexOrThrow(_cursor, "type");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfSourceAppPackage = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_package");
          final int _cursorIndexOfSourceAppLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_label");
          final int _cursorIndexOfIsPinned = CursorUtil.getColumnIndexOrThrow(_cursor, "is_pinned");
          final int _cursorIndexOfIsSecret = CursorUtil.getColumnIndexOrThrow(_cursor, "is_secret");
          final int _cursorIndexOfSensitiveType = CursorUtil.getColumnIndexOrThrow(_cursor, "sensitive_type");
          final int _cursorIndexOfSecretExpiresAt = CursorUtil.getColumnIndexOrThrow(_cursor, "secret_expires_at");
          final int _cursorIndexOfImageUri = CursorUtil.getColumnIndexOrThrow(_cursor, "image_uri");
          final int _cursorIndexOfThumbnailUri = CursorUtil.getColumnIndexOrThrow(_cursor, "thumbnail_uri");
          final int _cursorIndexOfContentHash = CursorUtil.getColumnIndexOrThrow(_cursor, "contentHash");
          final int _cursorIndexOfCharCount = CursorUtil.getColumnIndexOrThrow(_cursor, "char_count");
          final int _cursorIndexOfWordCount = CursorUtil.getColumnIndexOrThrow(_cursor, "word_count");
          final List<ClipEntity> _result = new ArrayList<ClipEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final ClipEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpContent;
            _tmpContent = _cursor.getString(_cursorIndexOfContent);
            final String _tmpType;
            _tmpType = _cursor.getString(_cursorIndexOfType);
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            final String _tmpSourceAppPackage;
            if (_cursor.isNull(_cursorIndexOfSourceAppPackage)) {
              _tmpSourceAppPackage = null;
            } else {
              _tmpSourceAppPackage = _cursor.getString(_cursorIndexOfSourceAppPackage);
            }
            final String _tmpSourceAppLabel;
            if (_cursor.isNull(_cursorIndexOfSourceAppLabel)) {
              _tmpSourceAppLabel = null;
            } else {
              _tmpSourceAppLabel = _cursor.getString(_cursorIndexOfSourceAppLabel);
            }
            final boolean _tmpIsPinned;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsPinned);
            _tmpIsPinned = _tmp != 0;
            final boolean _tmpIsSecret;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsSecret);
            _tmpIsSecret = _tmp_1 != 0;
            final String _tmpSensitiveType;
            _tmpSensitiveType = _cursor.getString(_cursorIndexOfSensitiveType);
            final Long _tmpSecretExpiresAt;
            if (_cursor.isNull(_cursorIndexOfSecretExpiresAt)) {
              _tmpSecretExpiresAt = null;
            } else {
              _tmpSecretExpiresAt = _cursor.getLong(_cursorIndexOfSecretExpiresAt);
            }
            final String _tmpImageUri;
            if (_cursor.isNull(_cursorIndexOfImageUri)) {
              _tmpImageUri = null;
            } else {
              _tmpImageUri = _cursor.getString(_cursorIndexOfImageUri);
            }
            final String _tmpThumbnailUri;
            if (_cursor.isNull(_cursorIndexOfThumbnailUri)) {
              _tmpThumbnailUri = null;
            } else {
              _tmpThumbnailUri = _cursor.getString(_cursorIndexOfThumbnailUri);
            }
            final String _tmpContentHash;
            _tmpContentHash = _cursor.getString(_cursorIndexOfContentHash);
            final int _tmpCharCount;
            _tmpCharCount = _cursor.getInt(_cursorIndexOfCharCount);
            final int _tmpWordCount;
            _tmpWordCount = _cursor.getInt(_cursorIndexOfWordCount);
            _item = new ClipEntity(_tmpId,_tmpContent,_tmpType,_tmpTimestamp,_tmpSourceAppPackage,_tmpSourceAppLabel,_tmpIsPinned,_tmpIsSecret,_tmpSensitiveType,_tmpSecretExpiresAt,_tmpImageUri,_tmpThumbnailUri,_tmpContentHash,_tmpCharCount,_tmpWordCount);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Object getExpiredSecrets(final long now,
      final Continuation<? super List<ClipEntity>> $completion) {
    final String _sql = "SELECT * FROM clips WHERE is_secret = 1 AND secret_expires_at IS NOT NULL AND secret_expires_at <= ?";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, now);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<List<ClipEntity>>() {
      @Override
      @NonNull
      public List<ClipEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "rowid");
          final int _cursorIndexOfContent = CursorUtil.getColumnIndexOrThrow(_cursor, "content");
          final int _cursorIndexOfType = CursorUtil.getColumnIndexOrThrow(_cursor, "type");
          final int _cursorIndexOfTimestamp = CursorUtil.getColumnIndexOrThrow(_cursor, "timestamp");
          final int _cursorIndexOfSourceAppPackage = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_package");
          final int _cursorIndexOfSourceAppLabel = CursorUtil.getColumnIndexOrThrow(_cursor, "source_app_label");
          final int _cursorIndexOfIsPinned = CursorUtil.getColumnIndexOrThrow(_cursor, "is_pinned");
          final int _cursorIndexOfIsSecret = CursorUtil.getColumnIndexOrThrow(_cursor, "is_secret");
          final int _cursorIndexOfSensitiveType = CursorUtil.getColumnIndexOrThrow(_cursor, "sensitive_type");
          final int _cursorIndexOfSecretExpiresAt = CursorUtil.getColumnIndexOrThrow(_cursor, "secret_expires_at");
          final int _cursorIndexOfImageUri = CursorUtil.getColumnIndexOrThrow(_cursor, "image_uri");
          final int _cursorIndexOfThumbnailUri = CursorUtil.getColumnIndexOrThrow(_cursor, "thumbnail_uri");
          final int _cursorIndexOfContentHash = CursorUtil.getColumnIndexOrThrow(_cursor, "contentHash");
          final int _cursorIndexOfCharCount = CursorUtil.getColumnIndexOrThrow(_cursor, "char_count");
          final int _cursorIndexOfWordCount = CursorUtil.getColumnIndexOrThrow(_cursor, "word_count");
          final List<ClipEntity> _result = new ArrayList<ClipEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final ClipEntity _item;
            final long _tmpId;
            _tmpId = _cursor.getLong(_cursorIndexOfId);
            final String _tmpContent;
            _tmpContent = _cursor.getString(_cursorIndexOfContent);
            final String _tmpType;
            _tmpType = _cursor.getString(_cursorIndexOfType);
            final long _tmpTimestamp;
            _tmpTimestamp = _cursor.getLong(_cursorIndexOfTimestamp);
            final String _tmpSourceAppPackage;
            if (_cursor.isNull(_cursorIndexOfSourceAppPackage)) {
              _tmpSourceAppPackage = null;
            } else {
              _tmpSourceAppPackage = _cursor.getString(_cursorIndexOfSourceAppPackage);
            }
            final String _tmpSourceAppLabel;
            if (_cursor.isNull(_cursorIndexOfSourceAppLabel)) {
              _tmpSourceAppLabel = null;
            } else {
              _tmpSourceAppLabel = _cursor.getString(_cursorIndexOfSourceAppLabel);
            }
            final boolean _tmpIsPinned;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfIsPinned);
            _tmpIsPinned = _tmp != 0;
            final boolean _tmpIsSecret;
            final int _tmp_1;
            _tmp_1 = _cursor.getInt(_cursorIndexOfIsSecret);
            _tmpIsSecret = _tmp_1 != 0;
            final String _tmpSensitiveType;
            _tmpSensitiveType = _cursor.getString(_cursorIndexOfSensitiveType);
            final Long _tmpSecretExpiresAt;
            if (_cursor.isNull(_cursorIndexOfSecretExpiresAt)) {
              _tmpSecretExpiresAt = null;
            } else {
              _tmpSecretExpiresAt = _cursor.getLong(_cursorIndexOfSecretExpiresAt);
            }
            final String _tmpImageUri;
            if (_cursor.isNull(_cursorIndexOfImageUri)) {
              _tmpImageUri = null;
            } else {
              _tmpImageUri = _cursor.getString(_cursorIndexOfImageUri);
            }
            final String _tmpThumbnailUri;
            if (_cursor.isNull(_cursorIndexOfThumbnailUri)) {
              _tmpThumbnailUri = null;
            } else {
              _tmpThumbnailUri = _cursor.getString(_cursorIndexOfThumbnailUri);
            }
            final String _tmpContentHash;
            _tmpContentHash = _cursor.getString(_cursorIndexOfContentHash);
            final int _tmpCharCount;
            _tmpCharCount = _cursor.getInt(_cursorIndexOfCharCount);
            final int _tmpWordCount;
            _tmpWordCount = _cursor.getInt(_cursorIndexOfWordCount);
            _item = new ClipEntity(_tmpId,_tmpContent,_tmpType,_tmpTimestamp,_tmpSourceAppPackage,_tmpSourceAppLabel,_tmpIsPinned,_tmpIsSecret,_tmpSensitiveType,_tmpSecretExpiresAt,_tmpImageUri,_tmpThumbnailUri,_tmpContentHash,_tmpCharCount,_tmpWordCount);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Object getClipsCount(final Continuation<? super Integer> $completion) {
    final String _sql = "SELECT COUNT(*) FROM clips";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<Integer>() {
      @Override
      @NonNull
      public Integer call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final Integer _result;
          if (_cursor.moveToFirst()) {
            final int _tmp;
            _tmp = _cursor.getInt(0);
            _result = _tmp;
          } else {
            _result = 0;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @Override
  public Object deleteClipsByIds(final List<Long> ids,
      final Continuation<? super Integer> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Integer>() {
      @Override
      @NonNull
      public Integer call() throws Exception {
        final StringBuilder _stringBuilder = StringUtil.newStringBuilder();
        _stringBuilder.append("DELETE FROM clips WHERE rowid IN (");
        final int _inputSize = ids.size();
        StringUtil.appendPlaceholders(_stringBuilder, _inputSize);
        _stringBuilder.append(")");
        final String _sql = _stringBuilder.toString();
        final SupportSQLiteStatement _stmt = __db.compileStatement(_sql);
        int _argIndex = 1;
        for (long _item : ids) {
          _stmt.bindLong(_argIndex, _item);
          _argIndex++;
        }
        __db.beginTransaction();
        try {
          final Integer _result = _stmt.executeUpdateDelete();
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}

package com.mindforge.app.data.local.db.dao;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.SharedSQLiteStatement;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import com.mindforge.app.data.local.db.entity.StreakRecordEntity;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import javax.annotation.processing.Generated;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import kotlinx.coroutines.flow.Flow;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class StreakDao_Impl implements StreakDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<StreakRecordEntity> __insertionAdapterOfStreakRecordEntity;

  private final SharedSQLiteStatement __preparedStmtOfClearAll;

  public StreakDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfStreakRecordEntity = new EntityInsertionAdapter<StreakRecordEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `streak_record` (`id`,`currentStreak`,`longestStreak`,`lastActiveDate`,`freezesAvailable`,`lastMonotonicElapsed`,`lastRealtimeMillis`) VALUES (?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final StreakRecordEntity entity) {
        statement.bindLong(1, entity.getId());
        statement.bindLong(2, entity.getCurrentStreak());
        statement.bindLong(3, entity.getLongestStreak());
        statement.bindString(4, entity.getLastActiveDate());
        statement.bindLong(5, entity.getFreezesAvailable());
        statement.bindLong(6, entity.getLastMonotonicElapsed());
        statement.bindLong(7, entity.getLastRealtimeMillis());
      }
    };
    this.__preparedStmtOfClearAll = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM streak_record";
        return _query;
      }
    };
  }

  @Override
  public Object upsertStreak(final StreakRecordEntity streak,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __insertionAdapterOfStreakRecordEntity.insert(streak);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object clearAll(final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfClearAll.acquire();
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
          __preparedStmtOfClearAll.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object getStreak(final Continuation<? super StreakRecordEntity> $completion) {
    final String _sql = "SELECT * FROM streak_record WHERE id = 1 LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<StreakRecordEntity>() {
      @Override
      @Nullable
      public StreakRecordEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfCurrentStreak = CursorUtil.getColumnIndexOrThrow(_cursor, "currentStreak");
          final int _cursorIndexOfLongestStreak = CursorUtil.getColumnIndexOrThrow(_cursor, "longestStreak");
          final int _cursorIndexOfLastActiveDate = CursorUtil.getColumnIndexOrThrow(_cursor, "lastActiveDate");
          final int _cursorIndexOfFreezesAvailable = CursorUtil.getColumnIndexOrThrow(_cursor, "freezesAvailable");
          final int _cursorIndexOfLastMonotonicElapsed = CursorUtil.getColumnIndexOrThrow(_cursor, "lastMonotonicElapsed");
          final int _cursorIndexOfLastRealtimeMillis = CursorUtil.getColumnIndexOrThrow(_cursor, "lastRealtimeMillis");
          final StreakRecordEntity _result;
          if (_cursor.moveToFirst()) {
            final int _tmpId;
            _tmpId = _cursor.getInt(_cursorIndexOfId);
            final int _tmpCurrentStreak;
            _tmpCurrentStreak = _cursor.getInt(_cursorIndexOfCurrentStreak);
            final int _tmpLongestStreak;
            _tmpLongestStreak = _cursor.getInt(_cursorIndexOfLongestStreak);
            final String _tmpLastActiveDate;
            _tmpLastActiveDate = _cursor.getString(_cursorIndexOfLastActiveDate);
            final int _tmpFreezesAvailable;
            _tmpFreezesAvailable = _cursor.getInt(_cursorIndexOfFreezesAvailable);
            final long _tmpLastMonotonicElapsed;
            _tmpLastMonotonicElapsed = _cursor.getLong(_cursorIndexOfLastMonotonicElapsed);
            final long _tmpLastRealtimeMillis;
            _tmpLastRealtimeMillis = _cursor.getLong(_cursorIndexOfLastRealtimeMillis);
            _result = new StreakRecordEntity(_tmpId,_tmpCurrentStreak,_tmpLongestStreak,_tmpLastActiveDate,_tmpFreezesAvailable,_tmpLastMonotonicElapsed,_tmpLastRealtimeMillis);
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
  public Flow<StreakRecordEntity> observeStreak() {
    final String _sql = "SELECT * FROM streak_record WHERE id = 1 LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"streak_record"}, new Callable<StreakRecordEntity>() {
      @Override
      @Nullable
      public StreakRecordEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfCurrentStreak = CursorUtil.getColumnIndexOrThrow(_cursor, "currentStreak");
          final int _cursorIndexOfLongestStreak = CursorUtil.getColumnIndexOrThrow(_cursor, "longestStreak");
          final int _cursorIndexOfLastActiveDate = CursorUtil.getColumnIndexOrThrow(_cursor, "lastActiveDate");
          final int _cursorIndexOfFreezesAvailable = CursorUtil.getColumnIndexOrThrow(_cursor, "freezesAvailable");
          final int _cursorIndexOfLastMonotonicElapsed = CursorUtil.getColumnIndexOrThrow(_cursor, "lastMonotonicElapsed");
          final int _cursorIndexOfLastRealtimeMillis = CursorUtil.getColumnIndexOrThrow(_cursor, "lastRealtimeMillis");
          final StreakRecordEntity _result;
          if (_cursor.moveToFirst()) {
            final int _tmpId;
            _tmpId = _cursor.getInt(_cursorIndexOfId);
            final int _tmpCurrentStreak;
            _tmpCurrentStreak = _cursor.getInt(_cursorIndexOfCurrentStreak);
            final int _tmpLongestStreak;
            _tmpLongestStreak = _cursor.getInt(_cursorIndexOfLongestStreak);
            final String _tmpLastActiveDate;
            _tmpLastActiveDate = _cursor.getString(_cursorIndexOfLastActiveDate);
            final int _tmpFreezesAvailable;
            _tmpFreezesAvailable = _cursor.getInt(_cursorIndexOfFreezesAvailable);
            final long _tmpLastMonotonicElapsed;
            _tmpLastMonotonicElapsed = _cursor.getLong(_cursorIndexOfLastMonotonicElapsed);
            final long _tmpLastRealtimeMillis;
            _tmpLastRealtimeMillis = _cursor.getLong(_cursorIndexOfLastRealtimeMillis);
            _result = new StreakRecordEntity(_tmpId,_tmpCurrentStreak,_tmpLongestStreak,_tmpLastActiveDate,_tmpFreezesAvailable,_tmpLastMonotonicElapsed,_tmpLastRealtimeMillis);
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

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}

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
import com.mindforge.app.data.local.db.entity.DailyActivityEntity;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
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
public final class DailyActivityDao_Impl implements DailyActivityDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<DailyActivityEntity> __insertionAdapterOfDailyActivityEntity;

  private final SharedSQLiteStatement __preparedStmtOfClearAll;

  public DailyActivityDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfDailyActivityEntity = new EntityInsertionAdapter<DailyActivityEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `daily_activities` (`dateString`,`sessionsCount`,`totalXp`,`dailyChallengeCompleted`) VALUES (?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final DailyActivityEntity entity) {
        statement.bindString(1, entity.getDateString());
        statement.bindLong(2, entity.getSessionsCount());
        statement.bindLong(3, entity.getTotalXp());
        final int _tmp = entity.getDailyChallengeCompleted() ? 1 : 0;
        statement.bindLong(4, _tmp);
      }
    };
    this.__preparedStmtOfClearAll = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM daily_activities";
        return _query;
      }
    };
  }

  @Override
  public Object upsertDailyActivity(final DailyActivityEntity activity,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __insertionAdapterOfDailyActivityEntity.insert(activity);
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
  public Object getActivity(final String dateString,
      final Continuation<? super DailyActivityEntity> $completion) {
    final String _sql = "SELECT * FROM daily_activities WHERE dateString = ? LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindString(_argIndex, dateString);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<DailyActivityEntity>() {
      @Override
      @Nullable
      public DailyActivityEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfDateString = CursorUtil.getColumnIndexOrThrow(_cursor, "dateString");
          final int _cursorIndexOfSessionsCount = CursorUtil.getColumnIndexOrThrow(_cursor, "sessionsCount");
          final int _cursorIndexOfTotalXp = CursorUtil.getColumnIndexOrThrow(_cursor, "totalXp");
          final int _cursorIndexOfDailyChallengeCompleted = CursorUtil.getColumnIndexOrThrow(_cursor, "dailyChallengeCompleted");
          final DailyActivityEntity _result;
          if (_cursor.moveToFirst()) {
            final String _tmpDateString;
            _tmpDateString = _cursor.getString(_cursorIndexOfDateString);
            final int _tmpSessionsCount;
            _tmpSessionsCount = _cursor.getInt(_cursorIndexOfSessionsCount);
            final int _tmpTotalXp;
            _tmpTotalXp = _cursor.getInt(_cursorIndexOfTotalXp);
            final boolean _tmpDailyChallengeCompleted;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfDailyChallengeCompleted);
            _tmpDailyChallengeCompleted = _tmp != 0;
            _result = new DailyActivityEntity(_tmpDateString,_tmpSessionsCount,_tmpTotalXp,_tmpDailyChallengeCompleted);
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
  public Flow<DailyActivityEntity> observeTodayActivity(final String dateString) {
    final String _sql = "SELECT * FROM daily_activities WHERE dateString = ? LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindString(_argIndex, dateString);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"daily_activities"}, new Callable<DailyActivityEntity>() {
      @Override
      @Nullable
      public DailyActivityEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfDateString = CursorUtil.getColumnIndexOrThrow(_cursor, "dateString");
          final int _cursorIndexOfSessionsCount = CursorUtil.getColumnIndexOrThrow(_cursor, "sessionsCount");
          final int _cursorIndexOfTotalXp = CursorUtil.getColumnIndexOrThrow(_cursor, "totalXp");
          final int _cursorIndexOfDailyChallengeCompleted = CursorUtil.getColumnIndexOrThrow(_cursor, "dailyChallengeCompleted");
          final DailyActivityEntity _result;
          if (_cursor.moveToFirst()) {
            final String _tmpDateString;
            _tmpDateString = _cursor.getString(_cursorIndexOfDateString);
            final int _tmpSessionsCount;
            _tmpSessionsCount = _cursor.getInt(_cursorIndexOfSessionsCount);
            final int _tmpTotalXp;
            _tmpTotalXp = _cursor.getInt(_cursorIndexOfTotalXp);
            final boolean _tmpDailyChallengeCompleted;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfDailyChallengeCompleted);
            _tmpDailyChallengeCompleted = _tmp != 0;
            _result = new DailyActivityEntity(_tmpDateString,_tmpSessionsCount,_tmpTotalXp,_tmpDailyChallengeCompleted);
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
  public Flow<List<DailyActivityEntity>> getRecentDailyActivities(final int limit) {
    final String _sql = "SELECT * FROM daily_activities ORDER BY dateString DESC LIMIT ?";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, limit);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"daily_activities"}, new Callable<List<DailyActivityEntity>>() {
      @Override
      @NonNull
      public List<DailyActivityEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfDateString = CursorUtil.getColumnIndexOrThrow(_cursor, "dateString");
          final int _cursorIndexOfSessionsCount = CursorUtil.getColumnIndexOrThrow(_cursor, "sessionsCount");
          final int _cursorIndexOfTotalXp = CursorUtil.getColumnIndexOrThrow(_cursor, "totalXp");
          final int _cursorIndexOfDailyChallengeCompleted = CursorUtil.getColumnIndexOrThrow(_cursor, "dailyChallengeCompleted");
          final List<DailyActivityEntity> _result = new ArrayList<DailyActivityEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final DailyActivityEntity _item;
            final String _tmpDateString;
            _tmpDateString = _cursor.getString(_cursorIndexOfDateString);
            final int _tmpSessionsCount;
            _tmpSessionsCount = _cursor.getInt(_cursorIndexOfSessionsCount);
            final int _tmpTotalXp;
            _tmpTotalXp = _cursor.getInt(_cursorIndexOfTotalXp);
            final boolean _tmpDailyChallengeCompleted;
            final int _tmp;
            _tmp = _cursor.getInt(_cursorIndexOfDailyChallengeCompleted);
            _tmpDailyChallengeCompleted = _tmp != 0;
            _item = new DailyActivityEntity(_tmpDateString,_tmpSessionsCount,_tmpTotalXp,_tmpDailyChallengeCompleted);
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

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}

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
import com.mindforge.app.data.local.db.entity.GameStatEntity;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Integer;
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
public final class GameStatDao_Impl implements GameStatDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<GameStatEntity> __insertionAdapterOfGameStatEntity;

  private final SharedSQLiteStatement __preparedStmtOfClearAll;

  public GameStatDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfGameStatEntity = new EntityInsertionAdapter<GameStatEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `game_stats` (`gameId`,`highestLevelUnlocked`,`totalPlays`,`bestScore`,`bestAccuracy`,`fastestSpeed`,`totalStars`) VALUES (?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final GameStatEntity entity) {
        statement.bindString(1, entity.getGameId());
        statement.bindLong(2, entity.getHighestLevelUnlocked());
        statement.bindLong(3, entity.getTotalPlays());
        statement.bindLong(4, entity.getBestScore());
        statement.bindDouble(5, entity.getBestAccuracy());
        statement.bindDouble(6, entity.getFastestSpeed());
        statement.bindLong(7, entity.getTotalStars());
      }
    };
    this.__preparedStmtOfClearAll = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM game_stats";
        return _query;
      }
    };
  }

  @Override
  public Object upsertGameStat(final GameStatEntity stat,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __insertionAdapterOfGameStatEntity.insert(stat);
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
  public Object getGameStat(final String gameId,
      final Continuation<? super GameStatEntity> $completion) {
    final String _sql = "SELECT * FROM game_stats WHERE gameId = ? LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindString(_argIndex, gameId);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<GameStatEntity>() {
      @Override
      @Nullable
      public GameStatEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfGameId = CursorUtil.getColumnIndexOrThrow(_cursor, "gameId");
          final int _cursorIndexOfHighestLevelUnlocked = CursorUtil.getColumnIndexOrThrow(_cursor, "highestLevelUnlocked");
          final int _cursorIndexOfTotalPlays = CursorUtil.getColumnIndexOrThrow(_cursor, "totalPlays");
          final int _cursorIndexOfBestScore = CursorUtil.getColumnIndexOrThrow(_cursor, "bestScore");
          final int _cursorIndexOfBestAccuracy = CursorUtil.getColumnIndexOrThrow(_cursor, "bestAccuracy");
          final int _cursorIndexOfFastestSpeed = CursorUtil.getColumnIndexOrThrow(_cursor, "fastestSpeed");
          final int _cursorIndexOfTotalStars = CursorUtil.getColumnIndexOrThrow(_cursor, "totalStars");
          final GameStatEntity _result;
          if (_cursor.moveToFirst()) {
            final String _tmpGameId;
            _tmpGameId = _cursor.getString(_cursorIndexOfGameId);
            final int _tmpHighestLevelUnlocked;
            _tmpHighestLevelUnlocked = _cursor.getInt(_cursorIndexOfHighestLevelUnlocked);
            final int _tmpTotalPlays;
            _tmpTotalPlays = _cursor.getInt(_cursorIndexOfTotalPlays);
            final int _tmpBestScore;
            _tmpBestScore = _cursor.getInt(_cursorIndexOfBestScore);
            final float _tmpBestAccuracy;
            _tmpBestAccuracy = _cursor.getFloat(_cursorIndexOfBestAccuracy);
            final float _tmpFastestSpeed;
            _tmpFastestSpeed = _cursor.getFloat(_cursorIndexOfFastestSpeed);
            final int _tmpTotalStars;
            _tmpTotalStars = _cursor.getInt(_cursorIndexOfTotalStars);
            _result = new GameStatEntity(_tmpGameId,_tmpHighestLevelUnlocked,_tmpTotalPlays,_tmpBestScore,_tmpBestAccuracy,_tmpFastestSpeed,_tmpTotalStars);
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
  public Flow<GameStatEntity> observeGameStat(final String gameId) {
    final String _sql = "SELECT * FROM game_stats WHERE gameId = ? LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindString(_argIndex, gameId);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"game_stats"}, new Callable<GameStatEntity>() {
      @Override
      @Nullable
      public GameStatEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfGameId = CursorUtil.getColumnIndexOrThrow(_cursor, "gameId");
          final int _cursorIndexOfHighestLevelUnlocked = CursorUtil.getColumnIndexOrThrow(_cursor, "highestLevelUnlocked");
          final int _cursorIndexOfTotalPlays = CursorUtil.getColumnIndexOrThrow(_cursor, "totalPlays");
          final int _cursorIndexOfBestScore = CursorUtil.getColumnIndexOrThrow(_cursor, "bestScore");
          final int _cursorIndexOfBestAccuracy = CursorUtil.getColumnIndexOrThrow(_cursor, "bestAccuracy");
          final int _cursorIndexOfFastestSpeed = CursorUtil.getColumnIndexOrThrow(_cursor, "fastestSpeed");
          final int _cursorIndexOfTotalStars = CursorUtil.getColumnIndexOrThrow(_cursor, "totalStars");
          final GameStatEntity _result;
          if (_cursor.moveToFirst()) {
            final String _tmpGameId;
            _tmpGameId = _cursor.getString(_cursorIndexOfGameId);
            final int _tmpHighestLevelUnlocked;
            _tmpHighestLevelUnlocked = _cursor.getInt(_cursorIndexOfHighestLevelUnlocked);
            final int _tmpTotalPlays;
            _tmpTotalPlays = _cursor.getInt(_cursorIndexOfTotalPlays);
            final int _tmpBestScore;
            _tmpBestScore = _cursor.getInt(_cursorIndexOfBestScore);
            final float _tmpBestAccuracy;
            _tmpBestAccuracy = _cursor.getFloat(_cursorIndexOfBestAccuracy);
            final float _tmpFastestSpeed;
            _tmpFastestSpeed = _cursor.getFloat(_cursorIndexOfFastestSpeed);
            final int _tmpTotalStars;
            _tmpTotalStars = _cursor.getInt(_cursorIndexOfTotalStars);
            _result = new GameStatEntity(_tmpGameId,_tmpHighestLevelUnlocked,_tmpTotalPlays,_tmpBestScore,_tmpBestAccuracy,_tmpFastestSpeed,_tmpTotalStars);
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
  public Flow<List<GameStatEntity>> getAllGameStats() {
    final String _sql = "SELECT * FROM game_stats";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"game_stats"}, new Callable<List<GameStatEntity>>() {
      @Override
      @NonNull
      public List<GameStatEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfGameId = CursorUtil.getColumnIndexOrThrow(_cursor, "gameId");
          final int _cursorIndexOfHighestLevelUnlocked = CursorUtil.getColumnIndexOrThrow(_cursor, "highestLevelUnlocked");
          final int _cursorIndexOfTotalPlays = CursorUtil.getColumnIndexOrThrow(_cursor, "totalPlays");
          final int _cursorIndexOfBestScore = CursorUtil.getColumnIndexOrThrow(_cursor, "bestScore");
          final int _cursorIndexOfBestAccuracy = CursorUtil.getColumnIndexOrThrow(_cursor, "bestAccuracy");
          final int _cursorIndexOfFastestSpeed = CursorUtil.getColumnIndexOrThrow(_cursor, "fastestSpeed");
          final int _cursorIndexOfTotalStars = CursorUtil.getColumnIndexOrThrow(_cursor, "totalStars");
          final List<GameStatEntity> _result = new ArrayList<GameStatEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final GameStatEntity _item;
            final String _tmpGameId;
            _tmpGameId = _cursor.getString(_cursorIndexOfGameId);
            final int _tmpHighestLevelUnlocked;
            _tmpHighestLevelUnlocked = _cursor.getInt(_cursorIndexOfHighestLevelUnlocked);
            final int _tmpTotalPlays;
            _tmpTotalPlays = _cursor.getInt(_cursorIndexOfTotalPlays);
            final int _tmpBestScore;
            _tmpBestScore = _cursor.getInt(_cursorIndexOfBestScore);
            final float _tmpBestAccuracy;
            _tmpBestAccuracy = _cursor.getFloat(_cursorIndexOfBestAccuracy);
            final float _tmpFastestSpeed;
            _tmpFastestSpeed = _cursor.getFloat(_cursorIndexOfFastestSpeed);
            final int _tmpTotalStars;
            _tmpTotalStars = _cursor.getInt(_cursorIndexOfTotalStars);
            _item = new GameStatEntity(_tmpGameId,_tmpHighestLevelUnlocked,_tmpTotalPlays,_tmpBestScore,_tmpBestAccuracy,_tmpFastestSpeed,_tmpTotalStars);
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
  public Flow<Integer> getTotalStarsFlow() {
    final String _sql = "SELECT SUM(totalStars) FROM game_stats";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"game_stats"}, new Callable<Integer>() {
      @Override
      @Nullable
      public Integer call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final Integer _result;
          if (_cursor.moveToFirst()) {
            final Integer _tmp;
            if (_cursor.isNull(0)) {
              _tmp = null;
            } else {
              _tmp = _cursor.getInt(0);
            }
            _result = _tmp;
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

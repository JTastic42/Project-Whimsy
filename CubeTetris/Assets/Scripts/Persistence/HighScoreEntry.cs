using System;

namespace CubeTetris.Persistence
{
    [Serializable]
    public class HighScoreEntry
    {
        public string playerName;
        public int score;
        public long unixTime;

        public HighScoreEntry() { }

        public HighScoreEntry(string playerName, int score, long unixTime)
        {
            this.playerName = string.IsNullOrEmpty(playerName) ? "Player" : playerName;
            this.score = score;
            this.unixTime = unixTime;
        }
    }
}

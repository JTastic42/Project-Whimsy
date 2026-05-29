using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace CubeTetris.Persistence
{
    public static class HighScoreStore
    {
        const int MaxEntries = 10;
        const string FileName = "highscores.json";

        static string PathForFile => Path.Combine(Application.persistentDataPath, FileName);

        [Serializable]
        class JsonWrapper
        {
            public List<HighScoreEntry> entries;
        }

        public static IReadOnlyList<HighScoreEntry> Load()
        {
            try
            {
                if (!File.Exists(PathForFile))
                    return Array.Empty<HighScoreEntry>();

                var json = File.ReadAllText(PathForFile);
                var w = JsonUtility.FromJson<JsonWrapper>(json);
                if (w?.entries == null)
                    return Array.Empty<HighScoreEntry>();
                return w.entries;
            }
            catch (Exception e)
            {
                Debug.LogWarning($"HighScoreStore.Load failed: {e.Message}");
                return Array.Empty<HighScoreEntry>();
            }
        }

        public static void TrySubmit(int score, string playerName = null)
        {
            if (score < 0)
                return;

            var list = new List<HighScoreEntry>(Load());
            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            list.Add(new HighScoreEntry(playerName, score, now));
            list.Sort((a, b) => b.score.CompareTo(a.score));
            if (list.Count > MaxEntries)
                list.RemoveRange(MaxEntries, list.Count - MaxEntries);

            try
            {
                var w = new JsonWrapper { entries = list ?? new List<HighScoreEntry>() };
                var json = JsonUtility.ToJson(w, true);
                Directory.CreateDirectory(Application.persistentDataPath);
                File.WriteAllText(PathForFile, json);
            }
            catch (Exception e)
            {
                Debug.LogWarning($"HighScoreStore.TrySubmit failed: {e.Message}");
            }
        }
    }
}

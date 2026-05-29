namespace CubeTetris.Game
{
    public static class ScoreMilestones
    {
        public static readonly int[] Thresholds = { 1000, 10000, 25000, 50000, 100000 };

        /// <summary>Returns speed tier 0..N based on score (higher = faster drops).</summary>
        public static int GetTier(int score)
        {
            var tier = 0;
            for (var i = 0; i < Thresholds.Length; i++)
            {
                if (score >= Thresholds[i])
                    tier = i + 1;
            }
            return tier;
        }

        public static float DropIntervalSeconds(int tier)
        {
            var baseInterval = 1.1f;
            var factor = 1f - 0.12f * tier;
            if (factor < 0.25f)
                factor = 0.25f;
            return baseInterval * factor;
        }
    }
}

using System.Collections.Generic;
using UnityEngine;

namespace CubeTetris.Pieces
{
    public static class PieceRotations
    {
        static readonly Matrix4x4[] Matrices = BuildOrientationMatrices();

        static Matrix4x4[] BuildOrientationMatrices()
        {
            var rx = Matrix4x4.Rotate(Quaternion.Euler(90f, 0f, 0f));
            var ry = Matrix4x4.Rotate(Quaternion.Euler(0f, 90f, 0f));
            var rz = Matrix4x4.Rotate(Quaternion.Euler(0f, 0f, 90f));
            var gens = new[] { rx, ry, rz };

            var seen = new HashSet<string>();
            var list = new List<Matrix4x4>();
            var queue = new Queue<Matrix4x4>();
            queue.Enqueue(Matrix4x4.identity);

            while (queue.Count > 0)
            {
                var m = queue.Dequeue();
                var key = MatrixKey(m);
                if (!seen.Add(key))
                    continue;
                list.Add(m);

                foreach (var g in gens)
                {
                    var next = m * g;
                    var nk = MatrixKey(next);
                    if (!seen.Contains(nk))
                        queue.Enqueue(next);
                }
            }

            return list.ToArray();
        }

        static string MatrixKey(Matrix4x4 m)
        {
            return $"{Round(m.m00)},{Round(m.m01)},{Round(m.m02)};" +
                   $"{Round(m.m10)},{Round(m.m11)},{Round(m.m12)};" +
                   $"{Round(m.m20)},{Round(m.m21)},{Round(m.m22)}";
        }

        static int Round(float f) => Mathf.RoundToInt(f * 1000f);

        public static IReadOnlyList<Matrix4x4> All => Matrices;

        public static Vector3Int[] Transform(IReadOnlyList<Vector3Int> baseOffsets, Matrix4x4 rot)
        {
            var result = new Vector3Int[baseOffsets.Count];
            for (var i = 0; i < baseOffsets.Count; i++)
            {
                var v = baseOffsets[i];
                var w = rot.MultiplyPoint3x4(new Vector3(v.x, v.y, v.z));
                result[i] = new Vector3Int(
                    Mathf.RoundToInt(w.x),
                    Mathf.RoundToInt(w.y),
                    Mathf.RoundToInt(w.z));
            }
            return result;
        }

        public static Vector3Int[] NormalizeOffsets(Vector3Int[] offsets)
        {
            var min = new Vector3Int(int.MaxValue, int.MaxValue, int.MaxValue);
            for (var i = 0; i < offsets.Length; i++)
                min = Vector3Int.Min(min, offsets[i]);

            var shifted = new Vector3Int[offsets.Length];
            for (var i = 0; i < offsets.Length; i++)
                shifted[i] = offsets[i] - min;
            return shifted;
        }
    }
}

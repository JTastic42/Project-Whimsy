using UnityEngine;

namespace CubeTetris.Pieces
{
    /// <summary>3D shapes built from unit cells; minimum piece is a 2×2×2 block (8 cells).</summary>
    public static class PieceDefinition
    {
        public static readonly Vector3Int[] Cube2x2x2 =
        {
            new Vector3Int(0, 0, 0), new Vector3Int(1, 0, 0), new Vector3Int(0, 1, 0), new Vector3Int(1, 1, 0),
            new Vector3Int(0, 0, 1), new Vector3Int(1, 0, 1), new Vector3Int(0, 1, 1), new Vector3Int(1, 1, 1),
        };

        /// <summary>Two 2×2×2 blocks along +Z (4×2×2 cells).</summary>
        public static readonly Vector3Int[] Bar2x2x4 =
        {
            new Vector3Int(0, 0, 0), new Vector3Int(1, 0, 0), new Vector3Int(0, 1, 0), new Vector3Int(1, 1, 0),
            new Vector3Int(0, 0, 1), new Vector3Int(1, 0, 1), new Vector3Int(0, 1, 1), new Vector3Int(1, 1, 1),
            new Vector3Int(0, 0, 2), new Vector3Int(1, 0, 2), new Vector3Int(0, 1, 2), new Vector3Int(1, 1, 2),
            new Vector3Int(0, 0, 3), new Vector3Int(1, 0, 3), new Vector3Int(0, 1, 3), new Vector3Int(1, 1, 3),
        };

        /// <summary>L-shape: two 2×2×2 cubes sharing an edge on the XY face at z=0..1.</summary>
        public static readonly Vector3Int[] LShape2x2 =
        {
            new Vector3Int(0, 0, 0), new Vector3Int(1, 0, 0), new Vector3Int(0, 1, 0), new Vector3Int(1, 1, 0),
            new Vector3Int(0, 0, 1), new Vector3Int(1, 0, 1), new Vector3Int(0, 1, 1), new Vector3Int(1, 1, 1),
            new Vector3Int(2, 0, 0), new Vector3Int(2, 1, 0), new Vector3Int(2, 0, 1), new Vector3Int(2, 1, 1),
        };

        public static readonly Vector3Int[][] Shapes = { Cube2x2x2, Bar2x2x4, LShape2x2 };
    }
}

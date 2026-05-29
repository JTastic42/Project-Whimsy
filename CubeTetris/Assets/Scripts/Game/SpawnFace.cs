using UnityEngine;

namespace CubeTetris.Game
{
    public enum SpawnFace
    {
        PosX,
        NegX,
        PosY,
        NegY,
        PosZ,
        NegZ,
    }

    public static class SpawnFaceExtensions
    {
        public static Vector3Int InwardNormal(this SpawnFace face)
        {
            switch (face)
            {
                case SpawnFace.PosX: return new Vector3Int(-1, 0, 0);
                case SpawnFace.NegX: return new Vector3Int(1, 0, 0);
                case SpawnFace.PosY: return new Vector3Int(0, -1, 0);
                case SpawnFace.NegY: return new Vector3Int(0, 1, 0);
                case SpawnFace.PosZ: return new Vector3Int(0, 0, -1);
                default: return new Vector3Int(0, 0, 1);
            }
        }

        public static Vector3Int TangentA(this SpawnFace face)
        {
            switch (face)
            {
                case SpawnFace.PosX:
                case SpawnFace.NegX:
                    return new Vector3Int(0, 1, 0);
                case SpawnFace.PosY:
                case SpawnFace.NegY:
                    return new Vector3Int(1, 0, 0);
                default:
                    return new Vector3Int(1, 0, 0);
            }
        }

        public static Vector3Int TangentB(this SpawnFace face)
        {
            switch (face)
            {
                case SpawnFace.PosX:
                case SpawnFace.NegX:
                    return new Vector3Int(0, 0, 1);
                case SpawnFace.PosY:
                case SpawnFace.NegY:
                    return new Vector3Int(0, 0, 1);
                default:
                    return new Vector3Int(0, 1, 0);
            }
        }
    }
}

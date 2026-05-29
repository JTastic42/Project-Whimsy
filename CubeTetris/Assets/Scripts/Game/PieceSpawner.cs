using CubeTetris.Grid;
using CubeTetris.Pieces;
using UnityEngine;

namespace CubeTetris.Game
{
    public static class PieceSpawner
    {
        public static bool TrySpawn(GridState grid, System.Random rng, out ActivePiece piece)
        {
            piece = default;

            var face = (SpawnFace)rng.Next(6);
            var shapeIndex = rng.Next(PieceDefinition.Shapes.Length);
            var rotIndex = rng.Next(PieceRotations.All.Count);
            var offsets = ActivePiece.ComputeOffsets(shapeIndex, rotIndex);

            var min = new Vector3Int(int.MaxValue, int.MaxValue, int.MaxValue);
            var max = new Vector3Int(int.MinValue, int.MinValue, int.MinValue);
            for (var i = 0; i < offsets.Length; i++)
            {
                var o = offsets[i];
                min = Vector3Int.Min(min, o);
                max = Vector3Int.Max(max, o);
            }

            for (var attempt = 0; attempt < 128; attempt++)
            {
                var p = RandomPositionOnFace(face, min, max, rng);
                if (ActivePiece.CanPlaceAt(grid, p, offsets))
                {
                    var color = (byte)(rng.Next(6) + 1);
                    piece = new ActivePiece(p, shapeIndex, rotIndex, face, color);
                    return true;
                }
            }

            return BruteForceSpawn(grid, face, shapeIndex, rotIndex, rng, out piece);
        }

        static bool BruteForceSpawn(
            GridState grid,
            SpawnFace face,
            int shapeIndex,
            int rotIndex,
            System.Random rng,
            out ActivePiece piece)
        {
            piece = default;
            var offsets = ActivePiece.ComputeOffsets(shapeIndex, rotIndex);

            var min = new Vector3Int(int.MaxValue, int.MaxValue, int.MaxValue);
            var max = new Vector3Int(int.MinValue, int.MinValue, int.MinValue);
            for (var i = 0; i < offsets.Length; i++)
            {
                var o = offsets[i];
                min = Vector3Int.Min(min, o);
                max = Vector3Int.Max(max, o);
            }

            for (var x = 0; x < GridState.Size; x++)
            for (var y = 0; y < GridState.Size; y++)
            for (var z = 0; z < GridState.Size; z++)
            {
                var p = new Vector3Int(x, y, z);
                if (!FlushOnFace(face, min, max, p))
                    continue;
                if (!ActivePiece.CanPlaceAt(grid, p, offsets))
                    continue;

                var color = (byte)(rng.Next(6) + 1);
                piece = new ActivePiece(p, shapeIndex, rotIndex, face, color);
                return true;
            }

            return false;
        }

        static bool FlushOnFace(SpawnFace face, Vector3Int min, Vector3Int max, Vector3Int pos)
        {
            switch (face)
            {
                case SpawnFace.PosX:
                    return pos.x + max.x == GridState.Size - 1;
                case SpawnFace.NegX:
                    return pos.x + min.x == 0;
                case SpawnFace.PosY:
                    return pos.y + max.y == GridState.Size - 1;
                case SpawnFace.NegY:
                    return pos.y + min.y == 0;
                case SpawnFace.PosZ:
                    return pos.z + max.z == GridState.Size - 1;
                default:
                    return pos.z + min.z == 0;
            }
        }

        static Vector3Int RandomPositionOnFace(SpawnFace face, Vector3Int min, Vector3Int max, System.Random rng)
        {
            var maxY = Mathf.Max(0, GridState.Size - 1 - max.y);
            var maxZ = Mathf.Max(0, GridState.Size - 1 - max.z);
            var maxX = Mathf.Max(0, GridState.Size - 1 - max.x);

            var ry = maxY > 0 ? rng.Next(0, maxY + 1) : 0;
            var rz = maxZ > 0 ? rng.Next(0, maxZ + 1) : 0;
            var rx = maxX > 0 ? rng.Next(0, maxX + 1) : 0;

            switch (face)
            {
                case SpawnFace.PosX:
                    return new Vector3Int(GridState.Size - 1 - max.x, ry, rz);
                case SpawnFace.NegX:
                    return new Vector3Int(-min.x, ry, rz);
                case SpawnFace.PosY:
                    return new Vector3Int(rx, GridState.Size - 1 - max.y, rz);
                case SpawnFace.NegY:
                    return new Vector3Int(rx, -min.y, rz);
                case SpawnFace.PosZ:
                    return new Vector3Int(rx, ry, GridState.Size - 1 - max.z);
                default:
                    return new Vector3Int(rx, ry, -min.z);
            }
        }
    }

    public struct ActivePiece
    {
        public Vector3Int Position;
        public int ShapeIndex;
        public int RotIndex;
        public SpawnFace Face;
        public byte Color;

        public ActivePiece(Vector3Int position, int shapeIndex, int rotIndex, SpawnFace face, byte color)
        {
            Position = position;
            ShapeIndex = shapeIndex;
            RotIndex = rotIndex;
            Face = face;
            Color = color;
        }

        public Vector3Int Gravity => Face.InwardNormal();

        public Vector3Int[] GetOffsets() => ComputeOffsets(ShapeIndex, RotIndex);

        public static Vector3Int[] ComputeOffsets(int shapeIndex, int rotIndex)
        {
            var baseShape = PieceDefinition.Shapes[shapeIndex];
            var rot = PieceRotations.All[rotIndex];
            return PieceRotations.NormalizeOffsets(PieceRotations.Transform(baseShape, rot));
        }

        public static bool CanPlaceAt(GridState grid, Vector3Int position, Vector3Int[] offsets)
        {
            for (var i = 0; i < offsets.Length; i++)
            {
                var c = position + offsets[i];
                if (!grid.InBounds(c))
                    return false;
                if (grid.IsOccupied(c))
                    return false;
            }
            return true;
        }

        public bool CanPlace(GridState grid)
        {
            return CanPlaceAt(grid, Position, GetOffsets());
        }

        public void GetWorldCells(Vector3Int[] buffer, Vector3Int[] offsets)
        {
            for (var i = 0; i < offsets.Length; i++)
                buffer[i] = Position + offsets[i];
        }
    }
}

using System.Collections.Generic;
using UnityEngine;

namespace CubeTetris.Grid
{
    public class GridState
    {
        public const int Size = 16;

        readonly byte[,,] _cells = new byte[Size, Size, Size];

        public bool InBounds(Vector3Int c) =>
            c.x >= 0 && c.x < Size && c.y >= 0 && c.y < Size && c.z >= 0 && c.z < Size;

        public bool IsOccupied(Vector3Int c) => _cells[c.x, c.y, c.z] != 0;

        public void SetCell(Vector3Int c, byte color)
        {
            _cells[c.x, c.y, c.z] = color;
        }

        public void ClearCell(Vector3Int c)
        {
            _cells[c.x, c.y, c.z] = 0;
        }

        public bool CanPlace(IReadOnlyList<Vector3Int> worldCells)
        {
            for (var i = 0; i < worldCells.Count; i++)
            {
                var c = worldCells[i];
                if (!InBounds(c))
                    return false;
                if (IsOccupied(c))
                    return false;
            }
            return true;
        }

        public void LockPiece(IReadOnlyList<Vector3Int> worldCells, byte color)
        {
            for (var i = 0; i < worldCells.Count; i++)
                SetCell(worldCells[i], color);
        }

        /// <summary>Clears full surface rows on each face (16 cells per row on that face).</summary>
        public int ClearShellRows(out int rowsCleared)
        {
            var rowCount = 0;
            var toClear = new HashSet<Vector3Int>();

            void AddRow(System.Func<int, int, Vector3Int> cellAt)
            {
                for (var r = 0; r < Size; r++)
                {
                    var full = true;
                    for (var t = 0; t < Size; t++)
                    {
                        var c = cellAt(r, t);
                        if (!InBounds(c) || _cells[c.x, c.y, c.z] == 0)
                        {
                            full = false;
                            break;
                        }
                    }
                    if (!full)
                        continue;
                    rowCount++;
                    for (var t = 0; t < Size; t++)
                        toClear.Add(cellAt(r, t));
                }
            }

            // +X face x=15: rows indexed by y, line along z
            AddRow((r, t) => new Vector3Int(15, r, t));
            // -X x=0
            AddRow((r, t) => new Vector3Int(0, r, t));
            // +Y y=15: row index r along z, line along x
            AddRow((r, t) => new Vector3Int(t, 15, r));
            // -Y y=0
            AddRow((r, t) => new Vector3Int(t, 0, r));
            // +Z z=15: row index r along y, line along x
            AddRow((r, t) => new Vector3Int(t, r, 15));
            // -Z z=0
            AddRow((r, t) => new Vector3Int(t, r, 0));

            foreach (var c in toClear)
                ClearCell(c);

            rowsCleared = rowCount;
            return toClear.Count;
        }

        public byte GetCell(Vector3Int c) => _cells[c.x, c.y, c.z];
    }
}

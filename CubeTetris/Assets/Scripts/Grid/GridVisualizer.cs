using CubeTetris.Game;
using CubeTetris.Grid;
using UnityEngine;

namespace CubeTetris.Grid
{
    public class GridVisualizer : MonoBehaviour
    {
        [SerializeField] float cellSize = 1f;
        [SerializeField] Material lockedMaterial;
        [SerializeField] Material ghostMaterial;

        Transform _lockedRoot;
        Transform _ghostRoot;

        void Awake()
        {
            _lockedRoot = new GameObject("LockedCells").transform;
            _lockedRoot.SetParent(transform, false);
            _ghostRoot = new GameObject("ActivePiece").transform;
            _ghostRoot.SetParent(transform, false);

            if (lockedMaterial == null)
            {
                lockedMaterial = new Material(LitShader());
                lockedMaterial.color = new Color(0.35f, 0.65f, 0.95f, 1f);
            }
            if (ghostMaterial == null)
            {
                ghostMaterial = new Material(LitShader());
                ghostMaterial.color = new Color(1f, 0.85f, 0.2f, 1f);
            }
        }

        static Shader LitShader() =>
            Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");

        public void RebuildLocked(GridState grid)
        {
            ClearChildren(_lockedRoot);
            for (var x = 0; x < GridState.Size; x++)
            for (var y = 0; y < GridState.Size; y++)
            for (var z = 0; z < GridState.Size; z++)
            {
                var c = grid.GetCell(new Vector3Int(x, y, z));
                if (c == 0)
                    continue;
                var cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
                cube.transform.SetParent(_lockedRoot, false);
                cube.transform.localPosition = GridToWorld(new Vector3Int(x, y, z));
                cube.transform.localScale = Vector3.one * (cellSize * 0.92f);
                ApplyColor(cube, c);
            }
        }

        void ApplyColor(GameObject cube, byte colorIndex)
        {
            var r = cube.GetComponent<Renderer>();
            var mat = new Material(lockedMaterial);
            var hue = (colorIndex % 6) / 6f;
            mat.color = Color.HSVToRGB(hue, 0.55f, 0.95f);
            r.sharedMaterial = mat;
        }

        public void DrawActive(ActivePiece piece, Vector3Int[] offsets)
        {
            ClearChildren(_ghostRoot);
            for (var i = 0; i < offsets.Length; i++)
            {
                var w = piece.Position + offsets[i];
                var cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
                cube.transform.SetParent(_ghostRoot, false);
                cube.transform.localPosition = GridToWorld(w);
                cube.transform.localScale = Vector3.one * (cellSize * 0.95f);
                var r = cube.GetComponent<Renderer>();
                var mat = new Material(ghostMaterial);
                var hue = (piece.Color % 6) / 6f;
                mat.color = Color.HSVToRGB(hue, 0.55f, 1f);
                r.sharedMaterial = mat;
                DestroyCollider(cube);
            }
        }

        static void DestroyCollider(GameObject go)
        {
            var c = go.GetComponent<Collider>();
            if (c != null)
                Destroy(c);
        }

        public void ClearActive()
        {
            ClearChildren(_ghostRoot);
        }

        void ClearChildren(Transform root)
        {
            for (var i = root.childCount - 1; i >= 0; i--)
                Destroy(root.GetChild(i).gameObject);
        }

        Vector3 GridToWorld(Vector3Int g)
        {
            return new Vector3(g.x, g.y, g.z) * cellSize;
        }

        public void DrawBounds()
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.transform.SetParent(transform, false);
            go.name = "Bounds";
            go.transform.localPosition = new Vector3(7.5f, 7.5f, 7.5f) * cellSize;
            go.transform.localScale = new Vector3(16.08f, 16.08f, 16.08f) * cellSize;
            var r = go.GetComponent<Renderer>();
            var mat = new Material(LitShader());
            mat.color = new Color(0.12f, 0.14f, 0.2f, 1f);
            r.sharedMaterial = mat;
            Destroy(go.GetComponent<Collider>());
        }
    }
}

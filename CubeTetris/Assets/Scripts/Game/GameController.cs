using CubeTetris.Grid;
using CubeTetris.Persistence;
using CubeTetris.Pieces;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace CubeTetris.Game
{
    public class GameController : MonoBehaviour
    {
        GridState _grid;
        ActivePiece _piece;
        bool _hasPiece;
        float _nextDropTime;
        System.Random _rng;
        int _score;
        bool _gameOver;

        Vector3Int[] _offsetCache;
        Vector3Int[] _worldBuffer;

        GridVisualizer _visualizer;

        Text _hudScore;
        Text _hudLevel;
        GameObject _gameOverRoot;
        Text _gameOverScoreText;

        const string TitleSceneName = "TitleScene";
        const string GameSceneName = "GameScene";

        void Awake()
        {
            _grid = new GridState();
            _rng = new System.Random();
            EnsureWorld();
            EnsureUi();
        }

        void Start()
        {
            _visualizer.DrawBounds();
            _visualizer.RebuildLocked(_grid);
            TrySpawnPiece();
        }

        void EnsureWorld()
        {
            if (FindObjectOfType<Camera>() == null)
            {
                var camGo = new GameObject("Main Camera");
                var cam = camGo.AddComponent<Camera>();
                cam.clearFlags = CameraClearFlags.SolidColor;
                cam.backgroundColor = new Color(0.06f, 0.07f, 0.1f);
                camGo.tag = "MainCamera";
                camGo.AddComponent<CubeTetris.CameraControl.OrbitCamera>();
            }

            if (FindObjectOfType<Light>() == null)
            {
                var lightGo = new GameObject("Directional Light");
                var l = lightGo.AddComponent<Light>();
                l.type = LightType.Directional;
                l.intensity = 1.05f;
                lightGo.transform.rotation = Quaternion.Euler(50f, -35f, 0f);
            }

            var vizGo = new GameObject("GridRoot");
            _visualizer = vizGo.AddComponent<GridVisualizer>();
        }

        void EnsureUi()
        {
            var es = FindObjectOfType<UnityEngine.EventSystems.EventSystem>();
            if (es == null)
            {
                var esGo = new GameObject("EventSystem");
                esGo.AddComponent<UnityEngine.EventSystems.EventSystem>();
                esGo.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
            }

            var canvasGo = new GameObject("Canvas");
            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasGo.AddComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            canvasGo.AddComponent<GraphicRaycaster>();

            var hud = new GameObject("HUD");
            hud.transform.SetParent(canvasGo.transform, false);
            var hudRect = hud.AddComponent<RectTransform>();
            hudRect.anchorMin = new Vector2(0, 1);
            hudRect.anchorMax = new Vector2(0, 1);
            hudRect.pivot = new Vector2(0, 1);
            hudRect.anchoredPosition = new Vector2(16, -16);

            _hudScore = CreateText(hud.transform, "Score: 0", 22, TextAnchor.UpperLeft);
            var levelGo = new GameObject("Level");
            levelGo.transform.SetParent(hud.transform, false);
            _hudLevel = CreateText(levelGo.transform, "Speed tier: 0", 18, TextAnchor.UpperLeft);
            var lr = levelGo.AddComponent<RectTransform>();
            lr.anchorMin = new Vector2(0, 1);
            lr.anchorMax = new Vector2(0, 1);
            lr.pivot = new Vector2(0, 1);
            lr.anchoredPosition = new Vector2(0, -40);

            _gameOverRoot = new GameObject("GameOver");
            _gameOverRoot.transform.SetParent(canvasGo.transform, false);
            var goRect = _gameOverRoot.AddComponent<RectTransform>();
            goRect.anchorMin = Vector2.zero;
            goRect.anchorMax = Vector2.one;
            goRect.offsetMin = Vector2.zero;
            goRect.offsetMax = Vector2.zero;

            var panel = new GameObject("Panel");
            panel.transform.SetParent(_gameOverRoot.transform, false);
            var pRect = panel.AddComponent<RectTransform>();
            pRect.anchorMin = new Vector2(0.5f, 0.5f);
            pRect.anchorMax = new Vector2(0.5f, 0.5f);
            pRect.sizeDelta = new Vector2(420, 260);
            var img = panel.AddComponent<Image>();
            img.color = new Color(0.08f, 0.09f, 0.12f, 0.96f);

            _gameOverScoreText = CreateText(panel.transform, "Game Over\nScore: 0", 26, TextAnchor.MiddleCenter);
            var scoreRt = _gameOverScoreText.GetComponent<RectTransform>();
            scoreRt.anchorMin = new Vector2(0.5f, 0.62f);
            scoreRt.anchorMax = new Vector2(0.5f, 0.62f);
            scoreRt.pivot = new Vector2(0.5f, 0.5f);
            scoreRt.anchoredPosition = Vector2.zero;
            scoreRt.sizeDelta = new Vector2(380, 100);

            CreateButton(panel.transform, "Play Again", new Vector2(0, -40), () =>
            {
                SceneManager.LoadScene(GameSceneName);
            });

            CreateButton(panel.transform, "Title", new Vector2(0, -100), () =>
            {
                SceneManager.LoadScene(TitleSceneName);
            });

            _gameOverRoot.SetActive(false);
        }

        static Text CreateText(Transform parent, string msg, int size, TextAnchor anchor)
        {
            var go = new GameObject("Text");
            go.transform.SetParent(parent, false);
            var t = go.AddComponent<Text>();
            t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            t.text = msg;
            t.fontSize = size;
            t.color = Color.white;
            t.alignment = anchor;
            var rt = go.GetComponent<RectTransform>();
            rt.sizeDelta = new Vector2(420, 80);
            return t;
        }

        static void CreateButton(Transform parent, string label, Vector2 pos, UnityEngine.Events.UnityAction onClick)
        {
            var go = new GameObject(label);
            go.transform.SetParent(parent, false);
            var rt = go.AddComponent<RectTransform>();
            rt.anchorMin = new Vector2(0.5f, 0.5f);
            rt.anchorMax = new Vector2(0.5f, 0.5f);
            rt.pivot = new Vector2(0.5f, 0.5f);
            rt.anchoredPosition = pos;
            rt.sizeDelta = new Vector2(200, 40);
            var img = go.AddComponent<Image>();
            img.color = new Color(0.22f, 0.45f, 0.85f, 1f);
            var btn = go.AddComponent<Button>();
            btn.onClick.AddListener(onClick);
            var txtGo = new GameObject("Label");
            txtGo.transform.SetParent(go.transform, false);
            var txt = txtGo.AddComponent<Text>();
            txt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            txt.text = label;
            txt.fontSize = 18;
            txt.color = Color.white;
            txt.alignment = TextAnchor.MiddleCenter;
            var trt = txtGo.GetComponent<RectTransform>();
            trt.anchorMin = Vector2.zero;
            trt.anchorMax = Vector2.one;
            trt.offsetMin = Vector2.zero;
            trt.offsetMax = Vector2.zero;
        }

        void Update()
        {
            if (_gameOver)
                return;

            RefreshHud();

            if (!_hasPiece)
                return;

            HandleInput();

            var soft = Input.GetKey(KeyCode.S);
            var interval = ScoreMilestones.DropIntervalSeconds(ScoreMilestones.GetTier(_score)) * (soft ? 0.18f : 1f);

            if (Time.time >= _nextDropTime)
            {
                StepGravity();
                _nextDropTime = Time.time + interval;
            }

            RefreshActiveVisual();
        }

        void RefreshHud()
        {
            _hudScore.text = $"Score: {_score}";
            _hudLevel.text = $"Speed tier: {ScoreMilestones.GetTier(_score)}";
        }

        void RefreshActiveVisual()
        {
            if (!_hasPiece || _visualizer == null)
                return;
            CacheOffsets();
            _visualizer.DrawActive(_piece, _offsetCache);
        }

        void CacheOffsets()
        {
            var o = _piece.GetOffsets();
            if (_offsetCache == null || _offsetCache.Length != o.Length)
                _offsetCache = new Vector3Int[o.Length];
            for (var i = 0; i < o.Length; i++)
                _offsetCache[i] = o[i];
            if (_worldBuffer == null || _worldBuffer.Length != o.Length)
                _worldBuffer = new Vector3Int[o.Length];
        }

        void HandleInput()
        {
            var ta = _piece.Face.TangentA();
            var tb = _piece.Face.TangentB();

            if (Input.GetKeyDown(KeyCode.LeftArrow))
                TryMove(-ta);
            if (Input.GetKeyDown(KeyCode.RightArrow))
                TryMove(ta);
            if (Input.GetKeyDown(KeyCode.UpArrow))
                TryMove(tb);
            if (Input.GetKeyDown(KeyCode.DownArrow))
                TryMove(-tb);

            if (Input.GetKeyDown(KeyCode.A))
                TryMove(-ta);
            if (Input.GetKeyDown(KeyCode.D))
                TryMove(ta);
            if (Input.GetKeyDown(KeyCode.W))
                TryMove(tb);
            if (Input.GetKeyDown(KeyCode.X))
                TryMove(-tb);

            if (Input.GetKeyDown(KeyCode.Q) || Input.GetKeyDown(KeyCode.E))
                TryRotate();

            if (Input.GetKeyDown(KeyCode.Space))
                HardDrop();
        }

        void TryMove(Vector3Int delta)
        {
            var newPos = _piece.Position + delta;
            CacheOffsets();
            if (!ValidatePlacement(newPos, _offsetCache, out var breach))
            {
                if (breach)
                    EndGame();
                return;
            }

            _piece.Position = newPos;
        }

        void TryRotate()
        {
            var next = (_piece.RotIndex + 1) % PieceRotations.All.Count;
            var newOffsets = ActivePiece.ComputeOffsets(_piece.ShapeIndex, next);
            if (!ValidatePlacement(_piece.Position, newOffsets, out var breach))
            {
                if (breach)
                    EndGame();
                return;
            }

            _piece.RotIndex = next;
        }

        bool ValidatePlacement(Vector3Int pos, Vector3Int[] offsets, out bool breach)
        {
            breach = false;
            for (var i = 0; i < offsets.Length; i++)
            {
                var c = pos + offsets[i];
                if (!_grid.InBounds(c))
                {
                    breach = true;
                    return false;
                }
                if (_grid.IsOccupied(c))
                    return false;
            }
            return true;
        }

        void StepGravity()
        {
            CacheOffsets();
            var g = _piece.Gravity;
            var newPos = _piece.Position + g;

            if (!ValidatePlacement(newPos, _offsetCache, out var breach))
            {
                if (breach)
                    EndGame();
                else
                    LockPiece();
                return;
            }

            _piece.Position = newPos;
        }

        void HardDrop()
        {
            CacheOffsets();
            var g = _piece.Gravity;
            while (true)
            {
                var newPos = _piece.Position + g;
                if (!ValidatePlacement(newPos, _offsetCache, out var breach))
                {
                    if (breach)
                        EndGame();
                    else
                        LockPiece();
                    return;
                }
                _piece.Position = newPos;
            }
        }

        void LockPiece()
        {
            CacheOffsets();
            for (var i = 0; i < _offsetCache.Length; i++)
                _worldBuffer[i] = _piece.Position + _offsetCache[i];
            _grid.LockPiece(_worldBuffer, _piece.Color);

            _grid.ClearShellRows(out var rowsCleared);
            AddScoreForRows(rowsCleared);

            _visualizer.RebuildLocked(_grid);
            _visualizer.ClearActive();

            _hasPiece = false;
            TrySpawnPiece();
            ResetDropTimer();
        }

        void AddScoreForRows(int rowsCleared)
        {
            if (rowsCleared <= 0)
                return;
            var bonus = rowsCleared > 1 ? 50 * (rowsCleared - 1) : 0;
            _score += rowsCleared * 100 + bonus;
        }

        void TrySpawnPiece()
        {
            if (!PieceSpawner.TrySpawn(_grid, _rng, out _piece))
            {
                EndGame();
                return;
            }

            _hasPiece = true;
            CacheOffsets();
            if (!ValidatePlacement(_piece.Position, _offsetCache, out _))
                EndGame();
        }

        void ResetDropTimer()
        {
            var interval = ScoreMilestones.DropIntervalSeconds(ScoreMilestones.GetTier(_score));
            _nextDropTime = Time.time + interval;
        }

        void EndGame()
        {
            if (_gameOver)
                return;
            _gameOver = true;
            _hasPiece = false;
            if (_visualizer != null)
                _visualizer.ClearActive();

            HighScoreStore.TrySubmit(_score);

            if (_gameOverScoreText != null)
                _gameOverScoreText.text = $"Game Over\nScore: {_score}\n(Top 10 saved locally)";
            if (_gameOverRoot != null)
                _gameOverRoot.SetActive(true);
        }
    }
}

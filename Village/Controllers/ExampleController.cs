using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Village.Data;
using Village.Data.Domain;
using Village.Models.Example;
using Microsoft.EntityFrameworkCore;

namespace Village.Controllers
{
    public class ExampleController : Controller
    {
        private readonly SqlContext _context;

        public ExampleController(SqlContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var examples = await _context.Examples.ToListAsync();
            return View(examples);
        }

        [HttpGet]
        public IActionResult Add()
        {
            return View(new ExampleViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Add(ExampleViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var example = Mapper.Map<Example>(model);
            using (var transaction = await _context.BeginTransactionAsync())
            {
                try
                {
                    await _context.AddAsync(example);
                    await _context.SaveChangesAsync();
                    transaction.Commit();
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    ModelState.AddModelError("SqlContextError", e.Message);
                    return View(model);
                }
            }

            return RedirectToAction("Index");
        }
    }
}
